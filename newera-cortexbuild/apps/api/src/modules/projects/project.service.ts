import { prisma } from '../../lib/prisma';

export function listProjects(tenantId: string) {
  return prisma.project.findMany({
    where: { tenantId },
    orderBy: { createdAt: 'desc' }
  });
}

export function createProject(tenantId: string, data: any) {
  return prisma.project.create({
    data: {
      tenantId,
      name: data.name,
      code: data.code,
      status: data.status,
      startDate: data.startDate ? new Date(data.startDate) : null,
      endDate: data.endDate ? new Date(data.endDate) : null,
      budget: data.budget
    }
  });
}

export async function updateProject(projectId: string, tenantId: string, data: any) {
  const project = await prisma.project.findFirst({
    where: { id: projectId, tenantId }
  });

  if (!project) {
    throw new Error('Project not found');
  }

  return prisma.project.update({
    where: { id: projectId },
    data: {
      ...data,
      startDate: data.startDate ? new Date(data.startDate) : undefined,
      endDate: data.endDate ? new Date(data.endDate) : undefined
    }
  });
}
