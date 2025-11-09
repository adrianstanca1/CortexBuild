import { prisma } from '../../lib/prisma';

export async function getPortfolioSnapshot(tenantId: string) {
  const [projectSummary, rfiSummary] = await Promise.all([
    prisma.project.groupBy({
      by: ['status'],
      _sum: { budget: true },
      _count: { _all: true },
      where: { tenantId }
    }),
    prisma.rFI.groupBy({
      by: ['status'],
      _count: { _all: true },
      where: { tenantId }
    })
  ]);

  return {
    projects: projectSummary.map((item) => ({
      status: item.status,
      count: item._count._all,
      budget: Number(item._sum.budget ?? 0)
    })),
    rfis: rfiSummary.map((item) => ({
      status: item.status,
      count: item._count._all
    }))
  };
}
