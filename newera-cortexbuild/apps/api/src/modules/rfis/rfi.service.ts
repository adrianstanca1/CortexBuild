import { prisma } from '../../lib/prisma';
import { randomInt } from 'node:crypto';

function generateRfiNumber() {
  return `RFI-${Date.now().toString().slice(-4)}-${randomInt(100, 999)}`;
}

export function listRFIs(tenantId: string, projectId?: string) {
  return prisma.rFI.findMany({
    where: {
      tenantId,
      projectId
    },
    orderBy: { createdAt: 'desc' }
  });
}

export function createRFI(input: {
  tenantId: string;
  projectId: string;
  subject: string;
  question: string;
  dueDate?: string;
  createdBy: string;
}) {
  return prisma.rFI.create({
    data: {
      tenantId: input.tenantId,
      projectId: input.projectId,
      subject: input.subject,
      question: input.question,
      dueDate: input.dueDate ? new Date(input.dueDate) : undefined,
      createdBy: input.createdBy,
      number: generateRfiNumber()
    }
  });
}

export async function updateRFI(rfiId: string, tenantId: string, data: any) {
  const rfi = await prisma.rFI.findFirst({
    where: { id: rfiId, tenantId }
  });

  if (!rfi) {
    throw new Error('RFI not found');
  }

  return prisma.rFI.update({
    where: { id: rfiId },
    data: {
      ...data,
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined
    }
  });
}
