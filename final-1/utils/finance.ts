import { Invoice, InvoiceStatus } from '../types';

export interface InvoiceFinancials {
  subtotal: number;
  taxAmount: number;
  retentionAmount: number;
  total: number;
  amountPaid: number;
  balance: number;
  payments: Invoice['payments'];
}

const toNumber = (value: unknown): number => {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : 0;
  }

  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
};

const parseDateValue = (value?: string): number | null => {
  if (!value) return null;
  const parsed = new Date(value);
  const timestamp = parsed.getTime();
  return Number.isNaN(timestamp) ? null : timestamp;
};

const getDueDateValue = (invoice: Invoice): number | null =>
  parseDateValue(invoice.dueAt || invoice.dueDate);

export const getInvoiceFinancials = (invoice: Invoice): InvoiceFinancials => {
  const lineItems = invoice.lineItems || [];
  const hasLineItems = lineItems.length > 0;

  const computedSubtotal = lineItems.reduce((acc, item) => {
    const quantity = toNumber(item.quantity);
    const rate = toNumber(item.unitPrice ?? item.rate);
    return acc + quantity * rate;
  }, 0);

  const storedSubtotal = toNumber(invoice.subtotal);
  const subtotal = hasLineItems ? computedSubtotal : storedSubtotal || computedSubtotal;

  const taxRate = toNumber(invoice.taxRate);
  const retentionRate = toNumber(invoice.retentionRate);

  const computedTaxAmount = subtotal * taxRate;
  const storedTaxAmount = toNumber(invoice.taxAmount);
  const taxAmount = hasLineItems || !storedTaxAmount ? computedTaxAmount : storedTaxAmount;

  const computedRetentionAmount = subtotal * retentionRate;
  const storedRetentionAmount = toNumber(invoice.retentionAmount);
  const retentionAmount = hasLineItems || !storedRetentionAmount ? computedRetentionAmount : storedRetentionAmount;

  const computedTotal = subtotal + taxAmount - retentionAmount;
  const storedTotal = toNumber(invoice.total);
  const total = hasLineItems || !storedTotal ? computedTotal : storedTotal;

  const payments = invoice.payments || [];
  const paidFromPayments = payments.reduce((acc, payment) => acc + toNumber(payment.amount), 0);
  const recordedPaidAmount = toNumber(invoice.amountPaid);

  const storedBalanceValue =
    !hasLineItems && invoice.balance !== undefined
      ? Math.max(0, toNumber(invoice.balance))
      : null;

  const amountPaidCandidates = [recordedPaidAmount, paidFromPayments];
  if (storedBalanceValue !== null) {
    amountPaidCandidates.push(Math.max(0, total - storedBalanceValue));
  }

  const rawAmountPaid = Math.max(0, ...amountPaidCandidates);
  const computedBalance = Math.max(0, total - rawAmountPaid);
  const balance =
    storedBalanceValue !== null && Number.isFinite(storedBalanceValue)
      ? Math.min(storedBalanceValue, Math.max(0, total))
      : computedBalance;

  const amountPaid = Math.max(rawAmountPaid, Math.max(0, total - balance));

  return { subtotal, taxAmount, retentionAmount, total, amountPaid, balance, payments };
};

export const getDerivedStatus = (invoice: Invoice, now: number = Date.now()): InvoiceStatus => {
  const { balance } = getInvoiceFinancials(invoice);

  if (invoice.status === InvoiceStatus.CANCELLED) return InvoiceStatus.CANCELLED;
  if (invoice.status === InvoiceStatus.DRAFT) return InvoiceStatus.DRAFT;
 

  if (invoice.status === InvoiceStatus.PAID) return InvoiceStatus.PAID;
  if (balance <= 0) return InvoiceStatus.PAID;

  const dueValue = getDueDateValue(invoice);

  if (
    (invoice.status === InvoiceStatus.SENT || invoice.status === InvoiceStatus.OVERDUE) &&
    dueValue !== null &&
    dueValue < now
  ) {
    return InvoiceStatus.OVERDUE;
  }

  return invoice.status;
};
