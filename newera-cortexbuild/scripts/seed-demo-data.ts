import { PrismaClient } from '@prisma/client';
import 'dotenv/config';

const prisma = new PrismaClient();

async function main() {
  const tenant = await prisma.tenant.upsert({
    where: { slug: 'demo-builders' },
    update: {},
    create: {
      name: 'Demo Builders',
      slug: 'demo-builders',
      plan: 'growth'
    }
  });

  const project = await prisma.project.upsert({
    where: { code: 'DB-001' },
    update: {},
    create: {
      tenantId: tenant.id,
      name: 'Downtown Tower Renovation',
      code: 'DB-001',
      status: 'active',
      budget: 12_500_000
    }
  });

  await prisma.user.upsert({
    where: { email: 'demo@newera.build' },
    update: {},
    create: {
      tenantId: tenant.id,
      email: 'demo@newera.build',
      fullName: 'Demo Superintendent',
      passwordHash: '$2a$10$abcdefghijklmnopqrstuv', // placeholder
      role: 'super_admin'
    }
  });

  await prisma.budgetLine.createMany({
    data: [
      {
        tenantId: tenant.id,
        projectId: project.id,
        category: 'Structural Steel',
        description: 'Steel package',
        amount: 3200000,
        committed: 2800000,
        forecast: 3300000
      },
      {
        tenantId: tenant.id,
        projectId: project.id,
        category: 'MEP',
        description: 'Mechanical, Electrical, Plumbing',
        amount: 4200000,
        committed: 4000000,
        forecast: 4250000
      }
    ],
    skipDuplicates: true
  });

  await prisma.invoice.createMany({
    data: [
      {
        tenantId: tenant.id,
        projectId: project.id,
        vendor: 'Skyline HVAC LLC',
        amount: 450000,
        status: 'submitted'
      },
      {
        tenantId: tenant.id,
        projectId: project.id,
        vendor: 'Brightline Electrical',
        amount: 275000,
        status: 'approved'
      }
    ],
    skipDuplicates: true
  });

  console.log('Seed data ready ✅');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
