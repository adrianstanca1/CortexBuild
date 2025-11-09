import { Router } from 'express';
import { authenticate, type AuthenticatedRequest } from '../../middleware/auth';
import * as budgetService from './budget.service';
import * as invoiceService from './invoice.service';
import { createBudgetLineSchema, updateBudgetLineSchema } from './budget.schemas';
import { createInvoiceSchema, updateInvoiceSchema } from './invoice.schemas';

export const financeRouter = Router();
financeRouter.use(authenticate);

financeRouter.get('/budgets', async (req: AuthenticatedRequest, res) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  const lines = await budgetService.listBudgetLines(req.user.tenantId, req.query.projectId as string | undefined);
  res.json({
    budget: lines.map((line) => ({
      ...line,
      amount: Number(line.amount),
      committed: Number(line.committed),
      forecast: Number(line.forecast)
    }))
  });
});

financeRouter.post('/budgets', async (req: AuthenticatedRequest, res) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  const parsed = createBudgetLineSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const line = await budgetService.createBudgetLine(req.user.tenantId, parsed.data);
  res.status(201).json({
    line: {
      ...line,
      amount: Number(line.amount),
      committed: Number(line.committed),
      forecast: Number(line.forecast)
    }
  });
});

financeRouter.put('/budgets/:lineId', async (req: AuthenticatedRequest, res) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  const parsed = updateBudgetLineSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  try {
    const line = await budgetService.updateBudgetLine(req.params.lineId, req.user.tenantId, parsed.data);
    res.json({
      line: {
        ...line,
        amount: Number(line.amount),
        committed: Number(line.committed),
        forecast: Number(line.forecast)
      }
    });
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
});

financeRouter.get('/invoices', async (req: AuthenticatedRequest, res) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  const invoices = await invoiceService.listInvoices(req.user.tenantId, req.query.status as string | undefined);
  res.json({
    invoices: invoices.map((invoice) => ({
      ...invoice,
      amount: Number(invoice.amount)
    }))
  });
});

financeRouter.post('/invoices', async (req: AuthenticatedRequest, res) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  const parsed = createInvoiceSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const invoice = await invoiceService.createInvoice(req.user.tenantId, parsed.data);
  res.status(201).json({ invoice: { ...invoice, amount: Number(invoice.amount) } });
});

financeRouter.put('/invoices/:invoiceId', async (req: AuthenticatedRequest, res) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  const parsed = updateInvoiceSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  try {
    const invoice = await invoiceService.updateInvoice(req.params.invoiceId, req.user.tenantId, parsed.data);
    res.json({ invoice: { ...invoice, amount: Number(invoice.amount) } });
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
});
