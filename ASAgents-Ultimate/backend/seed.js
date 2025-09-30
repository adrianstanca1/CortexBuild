import { initialiseSchema, getDatabase, PLATFORM_COMPANY_ID } from './database.js';
import { v4 as uuid } from 'uuid';
import crypto from 'crypto';

const now = () => new Date().toISOString();

const createInvoiceRecord = ({
  id = uuid(),
  companyId,
  clientId,
  projectId,
  invoiceNumber,
  status,
  issueDate,
  dueDate,
  lineItems,
  taxRate = 0,
  retentionRate = 0,
  notes = '',
}) => {
  const subtotal = lineItems.reduce((total, item) => total + item.quantity * item.unitPrice, 0);
  const taxAmount = subtotal * taxRate;
  const retentionAmount = subtotal * retentionRate;
  const total = subtotal + taxAmount - retentionAmount;
  const amountPaid = status === 'PAID' ? total : 0;
  const balance = total - amountPaid;

  return {
    invoice: {
      id,
      companyId,
      clientId,
      projectId,
      invoiceNumber,
      status,
      issueDate,
      dueDate,
      subtotal,
      taxRate,
      taxAmount,
      retentionRate,
      retentionAmount,
      total,
      amountPaid,
      balance,
      notes,
      createdAt: now(),
      updatedAt: now(),
    },
    lineItems: lineItems.map((item) => ({
      id: uuid(),
      invoiceId: id,
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      amount: item.quantity * item.unitPrice,
      createdAt: now(),
      updatedAt: now(),
    })),
  };
};

const seed = async () => {
  await initialiseSchema();
  const db = await getDatabase();

  const existingCompany = await db.get('SELECT id FROM companies LIMIT 1');
  if (existingCompany) {
    console.log('Database already seeded. Skipping.');
    return;
  }

  const companyId = '1';
  const ownerId = uuid();
  const projectManagerId = uuid();
  const platformOwnerId = uuid();

  await db.run(
    `INSERT INTO companies (id, name, type, email, phone, industry, status, subscription_plan)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    PLATFORM_COMPANY_ID,
    'Aurora Platform Operations',
    'PLATFORM',
    'platform@aurora.build',
    '+44 20 7946 0000',
    'Technology',
    'ACTIVE',
    'ENTERPRISE',
  );

  await db.run(
    `INSERT INTO companies (id, name, type, email, phone, industry, status, subscription_plan)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    companyId,
    'ConstructCo',
    'GENERAL_CONTRACTOR',
    'hello@constructco.com',
    '+44 20 7946 0958',
    'Construction',
    'ACTIVE',
    'PROFESSIONAL',
  );

  const hashPassword = (value) =>
    crypto.createHash('sha256').update(value).digest('hex');

  await db.run(
    `INSERT INTO users (id, company_id, name, email, role, username, password_hash, is_platform_owner)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    platformOwnerId,
    PLATFORM_COMPANY_ID,
    'Aurora Root',
    'root@aurora.build',
    'PRINCIPAL_ADMIN',
    'aurora.platform',
    hashPassword('Aurora!2024'),
    1,
  );

  await db.run(
    `INSERT INTO users (id, company_id, name, email, role, username, password_hash)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    ownerId,
    companyId,
    'Samantha Lee',
    'sam@constructco.com',
    'ADMIN',
    'samantha.lee',
    hashPassword('Samantha#2024'),
  );

  await db.run(
    `INSERT INTO users (id, company_id, name, email, role, username, password_hash)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    projectManagerId,
    companyId,
    'David Chen',
    'david@constructco.com',
    'PROJECT_MANAGER',
    'david.chen',
    hashPassword('David#2024'),
  );

  const projects = [
    {
      id: '101',
      name: 'Downtown Tower',
      description: '30-storey commercial development in central London',
      status: 'ACTIVE',
      budget: 5_000_000,
      spent: 3_250_000,
      startDate: '2023-01-15',
      endDate: '2025-06-30',
      lat: 51.5074,
      lng: -0.1278,
      address: '123 Main St, London',
      clientId: 'c-1',
      managerId: projectManagerId,
      progress: 68,
      actualCost: 3_250_000,
      projectType: 'Commercial',
      workClassification: 'New Build',
    },
    {
      id: '102',
      name: 'North Bridge Retrofit',
      description: 'Structural retrofit and seismic reinforcement programme',
      status: 'COMPLETED',
      budget: 1_200_000,
      spent: 1_350_000,
      startDate: '2022-11-01',
      endDate: '2024-02-15',
      lat: 53.4808,
      lng: -2.2426,
      address: '456 Oak Ave, Manchester',
      clientId: 'c-2',
      managerId: projectManagerId,
      progress: 100,
      actualCost: 1_350_000,
      projectType: 'Infrastructure',
      workClassification: 'Retrofit',
    },
  ];

  for (const project of projects) {
    await db.run(
      `INSERT INTO projects (
        id, company_id, name, description, status, budget, spent, start_date, end_date, lat, lng, address, client_id, manager_id, progress, actual_cost, project_type, work_classification
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      project.id,
      companyId,
      project.name,
      project.description,
      project.status,
      project.budget,
      project.spent,
      project.startDate,
      project.endDate,
      project.lat,
      project.lng,
      project.address,
      project.clientId,
      project.managerId,
      project.progress,
      project.actualCost,
      project.projectType,
      project.workClassification,
    );
  }

  const clients = [
    {
      id: 'c-1',
      name: 'Global Real Estate Inc.',
      email: 'accounts@gre.com',
      phone: '+44 20 7946 0101',
      contactPerson: 'Ava Harris',
      contactEmail: 'ava.harris@gre.com',
      contactPhone: '+44 20 7946 0101',
      billingAddress: 'Accounts Payable, 100 Market Street, London SW1A 1AA',
      paymentTerms: 'Net 30',
      isActive: 1,
      street: '100 Market Street',
      city: 'London',
      state: 'Greater London',
      zipCode: 'SW1A 1AA',
      country: 'United Kingdom',
    },
    {
      id: 'c-2',
      name: 'Northbridge Retail Group',
      email: 'finance@northbridge.com',
      phone: '+44 161 555 0198',
      contactPerson: 'Leo Patel',
      contactEmail: 'leo.patel@northbridge.com',
      contactPhone: '+44 161 555 0198',
      billingAddress: 'Finance Office, 50 King Street, Manchester M2 4LY',
      paymentTerms: 'Net 45',
      isActive: 1,
      street: '50 King Street',
      city: 'Manchester',
      state: 'Greater Manchester',
      zipCode: 'M2 4LY',
      country: 'United Kingdom',
    },
    {
      id: 'c-3',
      name: 'Evergreen Housing Association',
      email: 'procurement@evergreenha.org',
      phone: '+44 131 555 0200',
      contactPerson: 'Charlotte Reid',
      contactEmail: 'charlotte.reid@evergreenha.org',
      contactPhone: '+44 131 555 0200',
      billingAddress: 'Procurement, 25 Princes Street, Edinburgh EH2 2DG',
      paymentTerms: 'Net 30',
      isActive: 0,
      street: '25 Princes Street',
      city: 'Edinburgh',
      state: 'Lothian',
      zipCode: 'EH2 2DG',
      country: 'United Kingdom',
    },
  ];

  for (const client of clients) {
    await db.run(
      `INSERT INTO clients (
        id, company_id, name, email, phone, contact_person, contact_email, contact_phone, billing_address, payment_terms, is_active, street, city, state, zip_code, country
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      client.id,
      companyId,
      client.name,
      client.email,
      client.phone,
      client.contactPerson,
      client.contactEmail,
      client.contactPhone,
      client.billingAddress,
      client.paymentTerms,
      client.isActive,
      client.street,
      client.city,
      client.state,
      client.zipCode,
      client.country,
    );
  }

  const invoiceDefinitions = [
    createInvoiceRecord({
      companyId,
      clientId: 'c-1',
      projectId: '101',
      invoiceNumber: 'INV-001',
      status: 'PAID',
      issueDate: '2024-01-20',
      dueDate: '2024-02-20',
      taxRate: 0.2,
      retentionRate: 0.05,
      lineItems: [
        { description: 'Phase 1 structural works', quantity: 1, unitPrice: 100000 },
      ],
    }),
    createInvoiceRecord({
      companyId,
      clientId: 'c-2',
      projectId: '102',
      invoiceNumber: 'INV-002',
      status: 'OVERDUE',
      issueDate: '2024-10-05',
      dueDate: '2024-11-04',
      taxRate: 0.2,
      retentionRate: 0.05,
      lineItems: [
        { description: 'Retrofit programme stage 3', quantity: 1, unitPrice: 280000 },
        { description: 'Night works premium', quantity: 1, unitPrice: 32000 },
      ],
      notes: 'Awaiting variation order signature.',
    }),
    createInvoiceRecord({
      companyId,
      clientId: 'c-1',
      projectId: '101',
      invoiceNumber: 'INV-003',
      status: 'SENT',
      issueDate: '2024-12-01',
      dueDate: '2024-12-31',
      taxRate: 0.2,
      retentionRate: 0.05,
      lineItems: [
        { description: 'Curtain wall installation', quantity: 1, unitPrice: 185000 },
        { description: 'Facade QA inspections', quantity: 1, unitPrice: 12000 },
      ],
      notes: 'Retain access to level 18 through January.',
    }),
  ];

  for (const { invoice, lineItems } of invoiceDefinitions) {
    await db.run(
      `INSERT INTO invoices (
        id, company_id, client_id, project_id, invoice_number, issue_date, due_date, status, subtotal, tax_rate, tax_amount, retention_rate, retention_amount, total, amount_paid, balance, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      invoice.id,
      invoice.companyId,
      invoice.clientId,
      invoice.projectId,
      invoice.invoiceNumber,
      invoice.issueDate,
      invoice.dueDate,
      invoice.status,
      invoice.subtotal,
      invoice.taxRate,
      invoice.taxAmount,
      invoice.retentionRate,
      invoice.retentionAmount,
      invoice.total,
      invoice.amountPaid,
      invoice.balance,
      invoice.notes,
    );

    for (const item of lineItems) {
      await db.run(
        `INSERT INTO invoice_line_items (id, invoice_id, description, quantity, unit_price, amount) VALUES (?, ?, ?, ?, ?, ?)`,
        item.id,
        item.invoiceId,
        item.description,
        item.quantity,
        item.unitPrice,
        item.amount,
      );
    }
  }

  const overdueInvoice = invoiceDefinitions[1];
  await db.run(
    `INSERT INTO invoice_payments (id, invoice_id, amount, method, reference, notes, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    uuid(),
    overdueInvoice.invoice.id,
    overdueInvoice.invoice.total * 0.4,
    'BANK_TRANSFER',
    'PAY-948201',
    'Part payment received 10 Nov',
    ownerId,
  );

  console.log('Database seeded successfully.');
};

seed()
  .catch((error) => {
    console.error('Failed to seed database', error);
    process.exitCode = 1;
  })
  .finally(() => {
    process.exit();
  });
