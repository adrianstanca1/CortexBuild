import { prisma } from '../../lib/prisma';

export function listBudgetLines(tenantId: string, projectId?: string) {
  return prisma.budgetLine.findMany({
    where: {
      tenantId,
      projectId
    },
    orderBy: { createdAt: 'desc' }
  });
}

export function createBudgetLine(tenantId: string, data: any) {
  return prisma.budgetLine.create({
    data: {
      tenantId,
      projectId: data.projectId,
      category: data.category,
      description: data.description,
      amount: data.amount,
      committed: data.committed ?? 0,
      forecast: data.forecast ?? 0
    }
  });
}

export async function updateBudgetLine(lineId: string, tenantId: string, data: any) {
  const line = await prisma.budgetLine.findFirst({
    where: { id: lineId, tenantId }
  });

  if (!line) {
    throw new Error('Budget line not found');
  }

  return prisma.budgetLine.update({
    where: { id: lineId },
    data
  });
}
