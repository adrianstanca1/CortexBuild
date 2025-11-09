import React from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/api';
import type { BudgetLine, Invoice, Project } from '@newera/types';
import { CopilotPanel } from '../components/copilot/CopilotPanel';

type BudgetForm = {
  projectId: string;
  category: string;
  description: string;
  amount: number;
};

type InvoiceForm = {
  projectId: string;
  vendor: string;
  amount: number;
  dueDate?: string;
};

async function fetchBudget() {
  const res = await apiClient.get('/finance/budgets');
  return res.data.budget as BudgetLine[];
}

async function fetchInvoices() {
  const res = await apiClient.get('/finance/invoices');
  return res.data.invoices as Invoice[];
}

async function fetchProjects() {
  const res = await apiClient.get('/projects');
  return res.data.projects as Project[];
}

export const FinancePage: React.FC = () => {
  const queryClient = useQueryClient();
  const { data: budget } = useQuery({ queryKey: ['budget'], queryFn: fetchBudget });
  const { data: invoices } = useQuery({ queryKey: ['invoices'], queryFn: fetchInvoices });
  const { data: projects } = useQuery({ queryKey: ['projects'], queryFn: fetchProjects });

  const summary = React.useMemo(() => {
    const totalBudget = budget?.reduce((sum, line) => sum + line.amount, 0) ?? 0;
    const committed = budget?.reduce((sum, line) => sum + line.committed, 0) ?? 0;
    const forecast = budget?.reduce((sum, line) => sum + line.forecast, 0) ?? 0;
    const outstandingInvoices =
      invoices?.filter((invoice) => invoice.status !== 'paid').reduce((sum, invoice) => sum + invoice.amount, 0) ?? 0;
    return { totalBudget, committed, forecast, outstandingInvoices };
  }, [budget, invoices]);

  const { register: registerBudget, handleSubmit: submitBudget, reset: resetBudget } = useForm<BudgetForm>();
  const { register: registerInvoice, handleSubmit: submitInvoice, reset: resetInvoice } = useForm<InvoiceForm>();

  const budgetMutation = useMutation({
    mutationFn: (input: BudgetForm) => apiClient.post('/finance/budgets', input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budget'] });
      resetBudget();
    }
  });

  const invoiceMutation = useMutation({
    mutationFn: (input: InvoiceForm) => apiClient.post('/finance/invoices', input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      resetInvoice();
    }
  });

  return (
    <div className="finance">
      <section className="finance-summary">
        <article>
          <h2>Total budget</h2>
          <p>${summary.totalBudget.toLocaleString()}</p>
        </article>
        <article>
          <h2>Committed</h2>
          <p>${summary.committed.toLocaleString()}</p>
        </article>
        <article>
          <h2>Forecast</h2>
          <p>${summary.forecast.toLocaleString()}</p>
        </article>
        <article>
          <h2>Outstanding invoices</h2>
          <p>${summary.outstandingInvoices.toLocaleString()}</p>
        </article>
      </section>

      <section className="finance-grid">
        <div>
          <h3>Budget lines</h3>
          <table>
            <thead>
              <tr>
                <th>Project</th>
                <th>Category</th>
                <th>Description</th>
                <th>Amount</th>
                <th>Committed</th>
                <th>Forecast</th>
              </tr>
            </thead>
            <tbody>
              {budget?.map((line) => (
                <tr key={line.id}>
                  <td>{projects?.find((proj) => proj.id === line.projectId)?.name ?? '—'}</td>
                  <td>{line.category}</td>
                  <td>{line.description}</td>
                  <td>${line.amount.toLocaleString()}</td>
                  <td>${line.committed.toLocaleString()}</td>
                  <td>${line.forecast.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <form onSubmit={submitBudget((values) => budgetMutation.mutate({ ...values, amount: Number(values.amount) }))} className="stack">
            <h4>Add budget line</h4>
            <select {...registerBudget('projectId', { required: true })}>
              <option value="">Select project</option>
              {projects?.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
            <input placeholder="Category" {...registerBudget('category', { required: true })} />
            <input placeholder="Description" {...registerBudget('description', { required: true })} />
            <input type="number" step="0.01" placeholder="Amount" {...registerBudget('amount', { required: true, valueAsNumber: true })} />
            <button disabled={budgetMutation.isPending}>{budgetMutation.isPending ? 'Adding…' : 'Add line'}</button>
          </form>
        </div>
        <div>
          <h3>Invoices</h3>
          <table>
            <thead>
              <tr>
                <th>Vendor</th>
                <th>Project</th>
                <th>Status</th>
                <th>Amount</th>
                <th>Due</th>
              </tr>
            </thead>
            <tbody>
              {invoices?.map((invoice) => (
                <tr key={invoice.id}>
                  <td>{invoice.vendor}</td>
                  <td>{projects?.find((proj) => proj.id === invoice.projectId)?.name ?? '—'}</td>
                  <td>
                    <span className={`badge badge-${invoice.status}`}>{invoice.status}</span>
                  </td>
                  <td>${invoice.amount.toLocaleString()}</td>
                  <td>{invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <form onSubmit={submitInvoice((values) => invoiceMutation.mutate({ ...values, amount: Number(values.amount) }))} className="stack">
            <h4>Create invoice</h4>
            <select {...registerInvoice('projectId', { required: true })}>
              <option value="">Select project</option>
              {projects?.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
            <input placeholder="Vendor" {...registerInvoice('vendor', { required: true })} />
            <input type="number" step="0.01" placeholder="Amount" {...registerInvoice('amount', { required: true, valueAsNumber: true })} />
            <label>
              Due date
              <input type="date" {...registerInvoice('dueDate')} />
            </label>
            <button disabled={invoiceMutation.isPending}>{invoiceMutation.isPending ? 'Submitting…' : 'Create invoice'}</button>
          </form>
        </div>
        <CopilotPanel />
      </section>
    </div>
  );
};
