import { Invoice, InvoiceStatus } from '../../types';

// Financial utility functions
export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

export const calculateTax = (amount: number, taxRate: number): number => {
  return amount * (taxRate / 100);
};

export const calculateTotal = (subtotal: number, taxRate: number): number => {
  return subtotal + calculateTax(subtotal, taxRate);
};

export const formatPercentage = (value: number): string => {
  return `${(value * 100).toFixed(2)}%`;
};

export const calculateDiscount = (amount: number, discountPercent: number): number => {
  return amount * (discountPercent / 100);
};

export interface InvoiceFinancials {
  total: number;
  amountPaid: number;
  balance: number;
  payments: Array<{ amount: number; date: Date }>;
}

export const getInvoiceFinancials = (invoice: Invoice): InvoiceFinancials => {
  const total = invoice.amount || 0;
  const amountPaid = invoice.paidAmount || 0;
  const balance = total - amountPaid;
  const payments = invoice.payments || [];
  
  return { total, amountPaid, balance, payments };
};

export const getDerivedStatus = (invoice: Invoice): InvoiceStatus => {
  if (invoice.status === InvoiceStatus.PAID) {
    return InvoiceStatus.PAID;
  }
  
  if (invoice.dueDate) {
    const dueDate = new Date(invoice.dueDate);
    const now = new Date();
    if (dueDate < now && invoice.status !== InvoiceStatus.PAID) {
      return InvoiceStatus.OVERDUE;
    }
  }
  
  return invoice.status;
};
