import { describe, expect, it } from 'vitest';
import { getDerivedStatus, getInvoiceFinancials } from './finance';
import { Invoice, InvoiceLineItem, InvoiceStatus, InvoicePayment } from '../types';

const createLineItem = (overrides: Partial<InvoiceLineItem>): InvoiceLineItem => ({
  id: overrides.id ?? 'item-1',
  description: overrides.description ?? 'Service',
  quantity: overrides.quantity ?? 1,
  rate: overrides.rate ?? 0,
  amount: overrides.amount ?? 0,
  unitPrice: overrides.unitPrice ?? overrides.rate ?? 0,
});

const createPayment = (overrides: Partial<InvoicePayment>): InvoicePayment => ({
  id: overrides.id ?? `payment-${Math.random()}`,
  invoiceId: overrides.invoiceId ?? 'inv-1',
  amount: overrides.amount ?? 0,
  date: overrides.date ?? new Date('2024-01-10').toISOString(),
  method: overrides.method ?? 'BANK_TRANSFER',
  createdBy: overrides.createdBy ?? 'user-1',
  createdAt: overrides.createdAt ?? new Date('2024-01-10').toISOString(),
  reference: overrides.reference,
  notes: overrides.notes,
});

const createInvoice = (overrides: Partial<Invoice> = {}): Invoice => {
  const lineItems = overrides.lineItems ?? [
    createLineItem({ id: 'item-default', quantity: 1, unitPrice: 100, rate: 100, amount: 100 }),
  ];
  const payments = overrides.payments ?? [];

  return {
    id: overrides.id ?? 'inv-1',
    companyId: overrides.companyId ?? 'company-1',
    invoiceNumber: overrides.invoiceNumber ?? 'INV-001',
    projectId: overrides.projectId ?? 'project-1',
    clientId: overrides.clientId ?? 'client-1',
    companyId: overrides.companyId ?? 'company-1',
    issueDate: overrides.issueDate ?? new Date('2024-01-01').toISOString(),
    dueDate: overrides.dueDate ?? new Date('2024-02-01').toISOString(),
    status: overrides.status ?? InvoiceStatus.DRAFT,
    lineItems,
    subtotal: overrides.subtotal ?? 0,
    taxRate: overrides.taxRate ?? 0,
    taxAmount: overrides.taxAmount ?? 0,
    retentionRate: overrides.retentionRate ?? 0,
    retentionAmount: overrides.retentionAmount ?? 0,
    total: overrides.total ?? 0,
    amountPaid: overrides.amountPaid ?? 0,
    balance: overrides.balance ?? 0,
    notes: overrides.notes,
    createdAt: overrides.createdAt ?? new Date('2024-01-01').toISOString(),
    updatedAt: overrides.updatedAt ?? new Date('2024-01-01').toISOString(),
    payments,
    issuedAt: overrides.issuedAt ?? new Date('2024-01-01').toISOString(),
    dueAt: overrides.dueAt ?? new Date('2024-02-01').toISOString(),
  };
};

describe('getInvoiceFinancials', () => {
  it('calculates totals, taxes, retention and balances correctly', () => {
    const invoice = createInvoice({
      lineItems: [
        createLineItem({ id: 'item-1', quantity: 2, unitPrice: 100, amount: 200 }),
        createLineItem({ id: 'item-2', quantity: 1, unitPrice: 50, amount: 50 }),
      ],
      taxRate: 0.2,
      retentionRate: 0.1,
      payments: [
        createPayment({ id: 'payment-1', amount: 60 }),
        createPayment({ id: 'payment-2', amount: 90 }),
      ],
      amountPaid: 100,
    });

    const financials = getInvoiceFinancials(invoice);

    expect(financials.subtotal).toBeCloseTo(250);
    expect(financials.taxAmount).toBeCloseTo(50);
    expect(financials.retentionAmount).toBeCloseTo(25);
    expect(financials.total).toBeCloseTo(275);
    expect(financials.amountPaid).toBeCloseTo(150);
    expect(financials.balance).toBeCloseTo(125);
    expect(financials.payments).toHaveLength(2);
  });

  it('prefers recorded amountPaid when greater than payment totals', () => {
    const invoice = createInvoice({
      lineItems: [createLineItem({ id: 'item-1', quantity: 1, unitPrice: 100, amount: 100 })],
      payments: [createPayment({ id: 'payment-1', amount: 30 })],
      amountPaid: 80,
    });

    const financials = getInvoiceFinancials(invoice);

    expect(financials.amountPaid).toBe(80);
    expect(financials.balance).toBe(20);
  });

  it('never returns a negative balance when invoice is overpaid', () => {
    const invoice = createInvoice({
      lineItems: [createLineItem({ id: 'item-1', quantity: 1, unitPrice: 50, amount: 50 })],
      payments: [createPayment({ id: 'payment-1', amount: 60 })],
    });

    const financials = getInvoiceFinancials(invoice);

    expect(financials.balance).toBe(0);
  });


  it('falls back to stored totals when line items are unavailable', () => {
    const invoice = createInvoice({
      lineItems: [],
      subtotal: 500,
      taxAmount: 100,
      retentionAmount: 50,
      total: 550,
      balance: 150,
      amountPaid: 0,
    });

    const financials = getInvoiceFinancials(invoice);

    expect(financials.subtotal).toBe(500);
    expect(financials.taxAmount).toBe(100);
    expect(financials.retentionAmount).toBe(50);
    expect(financials.total).toBe(550);
    expect(financials.amountPaid).toBe(400);
    expect(financials.balance).toBe(150);
  });
});

describe('getDerivedStatus', () => {
  it('returns CANCELLED for cancelled invoices regardless of balance', () => {
    const invoice = createInvoice({
      status: InvoiceStatus.CANCELLED,
      lineItems: [createLineItem({ id: 'item-1', quantity: 1, unitPrice: 100, amount: 100 })],
    });

    expect(getDerivedStatus(invoice)).toBe(InvoiceStatus.CANCELLED);
  });

  it('returns DRAFT for draft invoices', () => {
    const invoice = createInvoice({ status: InvoiceStatus.DRAFT });

    expect(getDerivedStatus(invoice)).toBe(InvoiceStatus.DRAFT);
  });

  it('returns PAID when the balance is zero', () => {
    const invoice = createInvoice({
      status: InvoiceStatus.SENT,
      lineItems: [createLineItem({ id: 'item-1', quantity: 1, unitPrice: 120, amount: 120 })],
      payments: [createPayment({ id: 'payment-1', amount: 120 })],
    });

    expect(getDerivedStatus(invoice)).toBe(InvoiceStatus.PAID);
  });


  it('honours PAID status even when payments data is missing', () => {
    const invoice = createInvoice({
      status: InvoiceStatus.PAID,
      lineItems: [createLineItem({ id: 'item-1', quantity: 2, unitPrice: 150, amount: 300 })],
      payments: [],
      amountPaid: 0,
      balance: 0,
    });

    expect(getDerivedStatus(invoice)).toBe(InvoiceStatus.PAID);
  });

  it('returns OVERDUE when the due date has passed and balance remains', () => {
    const invoice = createInvoice({
      status: InvoiceStatus.SENT,
      dueAt: new Date('2024-01-10').toISOString(),
      lineItems: [createLineItem({ id: 'item-1', quantity: 1, unitPrice: 200, amount: 200 })],
      payments: [createPayment({ id: 'payment-1', amount: 50 })],
    });

    const derived = getDerivedStatus(invoice, new Date('2024-02-01').getTime());

    expect(derived).toBe(InvoiceStatus.OVERDUE);
  });

  it('keeps the original status when not overdue', () => {
    const invoice = createInvoice({
      status: InvoiceStatus.SENT,
      dueAt: new Date('2024-03-10').toISOString(),
      lineItems: [createLineItem({ id: 'item-1', quantity: 1, unitPrice: 200, amount: 200 })],
      payments: [createPayment({ id: 'payment-1', amount: 50 })],
    });

    const derived = getDerivedStatus(invoice, new Date('2024-02-01').getTime());

    expect(derived).toBe(InvoiceStatus.SENT);
  });
});
