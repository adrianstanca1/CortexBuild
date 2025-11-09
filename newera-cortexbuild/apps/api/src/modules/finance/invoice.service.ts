import { prisma } from '../../lib/prisma';

export function listInvoices(tenantId: string, status?: string) {
  return prisma.invoice.findMany({
    where: {
      tenantId,
      status: status ? status : undefined
    },
    orderBy: { createdAt: 'desc' }
  });
}

export function createInvoice(tenantId: string, data: any) {
  return prisma.invoice.create({
    data: {
      tenantId,
      projectId: data.projectId,
      vendor: data.vendor,
      amount: data.amount,
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      status: 'draft'
    }
  });
}

export async function updateInvoice(invoiceId: string, tenantId: string, data: any) {
  const invoice = await prisma.invoice.findFirst({
    where: { id: invoiceId, tenantId }
  });

  if (!invoice) {
    throw new Error('Invoice not found');
  }

  return prisma.invoice.update({
    where: { id: invoiceId },
    data: {
      ...data,
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined
    }
  });
}
