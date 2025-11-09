import { prisma } from '../../lib/prisma';

export function getTenant(tenantId: string) {
  return prisma.tenant.findUnique({
    where: { id: tenantId }
  });
}

export function updateTenant(tenantId: string, data: { name: string; plan: string }) {
  return prisma.tenant.update({
    where: { id: tenantId },
    data
  });
}
