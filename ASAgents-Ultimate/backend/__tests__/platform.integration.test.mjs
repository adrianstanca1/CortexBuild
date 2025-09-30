import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { once } from 'node:events';
import { fileURLToPath, pathToFileURL } from 'node:url';

process.env.NODE_ENV = 'test';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const testDbFile = path.resolve(__dirname, '../data/test-platform.db');
process.env.DATABASE_FILE = testDbFile;

const serverModule = await import(pathToFileURL(path.resolve(__dirname, '../server.js')).href);
const databaseModule = await import(pathToFileURL(path.resolve(__dirname, '../database.js')).href);

const { app } = serverModule;
const { getDatabase, initialiseSchema, PLATFORM_COMPANY_ID } = databaseModule;

let db;
let server;
let baseUrl;

const jsonRequest = async (method, url, body) => {
  const response = await fetch(`${baseUrl}${url}`, {
    method,
    headers: {
      'content-type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const contentType = response.headers.get('content-type') ?? '';
  const parsed = contentType.includes('application/json') ? await response.json() : undefined;

  return { status: response.status, body: parsed };
};

test.before(async () => {
  await fs.rm(testDbFile, { force: true });
  await initialiseSchema();
  db = await getDatabase();
  server = app.listen(0);
  await once(server, 'listening');
  const address = server.address();
  if (!address || typeof address === 'string') {
    throw new Error('Failed to determine test server address');
  }
  baseUrl = `http://127.0.0.1:${address.port}`;
});

test.after(async () => {
  if (server) {
    await new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve(undefined))));
  }
  if (db) {
    await db.close();
  }
  await fs.rm(testDbFile, { force: true });
});

test.beforeEach(async () => {
  await db.exec(`
    DELETE FROM auth_sessions;
    DELETE FROM invoice_payments;
    DELETE FROM invoice_line_items;
    DELETE FROM invoices;
    DELETE FROM projects;
    DELETE FROM clients;
    DELETE FROM users;
    DELETE FROM companies;
  `);

  const now = new Date().toISOString();

  await db.run(
    `INSERT INTO companies (id, name, type, email, phone, industry, status, subscription_plan, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    PLATFORM_COMPANY_ID,
    'Aurora Platform Ops',
    'PLATFORM',
    'platform@aurora.build',
    '+44 20 7946 0000',
    'Technology',
    'ACTIVE',
    'ENTERPRISE',
    now,
    now,
  );

  await db.run(
    `INSERT INTO users (id, company_id, name, email, role, username, password_hash, is_platform_owner, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    'owner-platform',
    PLATFORM_COMPANY_ID,
    'Aurora Root',
    'root@aurora.build',
    'PRINCIPAL_ADMIN',
    'aurora.platform',
    'hash',
    1,
    now,
    now,
  );

  await db.run(
    `INSERT INTO companies (id, name, type, email, phone, industry, status, subscription_plan, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    'tenant-a',
    'Northwind Construction',
    'GENERAL_CONTRACTOR',
    'finance@northwind.test',
    '+1-555-0100',
    'Construction',
    'ACTIVE',
    'PROFESSIONAL',
    now,
    now,
  );

  await db.run(
    `INSERT INTO companies (id, name, type, email, phone, industry, status, subscription_plan, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    'tenant-b',
    'Skyline Facades',
    'SUBCONTRACTOR',
    'ops@skyline.test',
    '+1-555-0101',
    'Cladding',
    'ACTIVE',
    'STARTER',
    now,
    now,
  );

  await db.run(
    `INSERT INTO users (id, company_id, name, email, role, username, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?), (?, ?, ?, ?, ?, ?, ?, ?)`,
    'user-a-1',
    'tenant-a',
    'Jordan Mills',
    'jordan@northwind.test',
    'ADMIN',
    'jordan.mills',
    now,
    now,
    'user-a-2',
    'tenant-a',
    'Priya Desai',
    'priya@northwind.test',
    'PROJECT_MANAGER',
    'priya.desai',
    now,
    now,
  );

  await db.run(
    `INSERT INTO users (id, company_id, name, email, role, username, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    'user-b-1',
    'tenant-b',
    'Alex Rivera',
    'alex@skyline.test',
    'OWNER',
    'alex.rivera',
    now,
    now,
  );

  await db.run(
    `INSERT INTO projects (id, company_id, name, status, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?), (?, ?, ?, ?, ?, ?)`,
    'proj-a-1',
    'tenant-a',
    'City Tower Fitout',
    'ACTIVE',
    now,
    now,
    'proj-b-1',
    'tenant-b',
    'Mall Facade Refresh',
    'IN_PROGRESS',
    now,
    now,
  );

  await db.run(
    `INSERT INTO clients (id, company_id, name, email, contact_person, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?), (?, ?, ?, ?, ?, ?, ?), (?, ?, ?, ?, ?, ?, ?)`,
    'client-1',
    'tenant-a',
    'City Development Ltd',
    'billing@city.dev',
    'Ava Harris',
    now,
    now,
    'client-2',
    'tenant-a',
    'Northwind Retail',
    'accounts@northwind.dev',
    'Luca Romano',
    now,
    now,
    'client-3',
    'tenant-b',
    'Skyline Partners',
    'finance@skyline.dev',
    'Leah Morgan',
    now,
    now,
  );

  await db.run(
    `INSERT INTO invoices (id, company_id, client_id, project_id, invoice_number, status, total, balance, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?), (?, ?, ?, ?, ?, ?, ?, ?, ?, ?), (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    'inv-a-1',
    'tenant-a',
    'client-1',
    'proj-a-1',
    'INV-001',
    'PAID',
    12500,
    0,
    now,
    now,
    'inv-a-2',
    'tenant-a',
    'client-2',
    'proj-a-1',
    'INV-002',
    'OVERDUE',
    7200,
    2150,
    now,
    now,
    'inv-b-1',
    'tenant-b',
    'client-3',
    'proj-b-1',
    'INV-101',
    'SENT',
    5400,
    5400,
    now,
    now,
  );
});

test('lists tenant summaries with aggregated metrics', async () => {
  const response = await jsonRequest('GET', '/platform/tenants');
  assert.equal(response.status, 200);
  assert.ok(response.body);
  assert.equal(response.body.source, 'backend');
  assert.equal(Array.isArray(response.body.tenants), true);
  assert.equal(response.body.tenants.length, 2);

  const tenantA = response.body.tenants.find((tenant) => tenant.id === 'tenant-a');
  assert.ok(tenantA);
  assert.equal(tenantA.totalUsers, 2);
  assert.equal(tenantA.totalProjects, 1);
  assert.equal(tenantA.activeProjects, 1);
  assert.equal(tenantA.overdueInvoices, 1);
  assert.equal(tenantA.totalRevenue, 12500 + 7200);
  assert.equal(tenantA.outstandingBalance, 2150);
  assert.equal(tenantA.collectedRevenue, 12500);
});

test('reports platform metrics and owner details', async () => {
  const response = await jsonRequest('GET', '/platform/metrics');
  assert.equal(response.status, 200);
  assert.ok(response.body.metrics);
  const metricsMap = new Map(response.body.metrics.map((metric) => [metric.name, metric.value]));
  assert.equal(metricsMap.get('Active Tenants'), 2);
  assert.equal(metricsMap.get('Active Projects'), 2);
  assert.equal(metricsMap.get('Total Invoice Value'), 12500 + 7200 + 5400);
  assert.equal(response.body.platformOwner.username, 'aurora.platform');
  assert.equal(response.body.platformOwner.email, 'root@aurora.build');
  assert.equal(response.body.source, 'backend');
});

test('lists all companies including platform record', async () => {
  const response = await jsonRequest('GET', '/companies');
  assert.equal(response.status, 200);
  assert.equal(response.body.length, 3);
  const platformRecord = response.body.find((company) => company.id === PLATFORM_COMPANY_ID);
  assert.ok(platformRecord);
  assert.equal(platformRecord.subscriptionPlan, 'ENTERPRISE');
});
