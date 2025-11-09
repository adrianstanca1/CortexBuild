import { prisma } from '../../lib/prisma';

export type FinanceAlert = {
  id: string;
  type: 'invoice_overdue' | 'budget_over_commit';
  severity: 'warning' | 'critical';
  message: string;
};

export async function getFinanceAlerts(tenantId: string): Promise<FinanceAlert[]> {
  const now = new Date();
  const [budgetLines, invoices] = await Promise.all([
    prisma.budgetLine.findMany({ where: { tenantId } }),
    prisma.invoice.findMany({ where: { tenantId } })
  ]);

  const alerts: FinanceAlert[] = [];

  for (const line of budgetLines) {
    const amount = Number(line.amount);
    const committed = Number(line.committed);
    const forecast = Number(line.forecast);
    if (committed > amount || forecast > amount) {
      alerts.push({
        id: `budget-${line.id}`,
        type: 'budget_over_commit',
        severity: committed > amount * 1.05 ? 'critical' : 'warning',
        message: `${line.category} for project ${line.projectId} is tracking ${
          committed > amount ? 'over committed' : 'over forecast'
        } (${Math.round(((committed > amount ? committed : forecast) / amount - 1) * 100)}% above budget).`
      });
    }
  }

  for (const invoice of invoices) {
    if (!invoice.dueDate) continue;
    const due = new Date(invoice.dueDate);
    if (due < now && invoice.status !== 'paid' && invoice.status !== 'void') {
      alerts.push({
        id: `invoice-${invoice.id}`,
        type: 'invoice_overdue',
        severity: 'warning',
        message: `${invoice.vendor} invoice is past due (${due.toDateString()}) at $${Number(invoice.amount).toLocaleString()}.`
      });
    }
  }

  return alerts;
}
