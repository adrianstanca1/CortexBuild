import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { once } from 'node:events';
import { fileURLToPath, pathToFileURL } from 'node:url';

process.env.NODE_ENV = 'test';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const testDbFile = path.resolve(__dirname, '../data/test-app.db');
process.env.DATABASE_FILE = testDbFile;

const serverModule = await import(pathToFileURL(path.resolve(__dirname, '../server.js')).href);
const databaseModule = await import(pathToFileURL(path.resolve(__dirname, '../database.js')).href);

const { app } = serverModule;
const { getDatabase, initialiseSchema } = databaseModule;

const COMPANY_ID = 'test-company';
const PROJECT_ID = 'project-1';

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

  let parsed;
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    parsed = await response.json();
  }

  return {
    status: response.status,
    body: parsed,
  };
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
    await new Promise((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve(undefined))),
    );
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
    `INSERT INTO companies (id, name, type, email, phone, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    COMPANY_ID,
    'Integration Test Co',
    'GENERAL_CONTRACTOR',
    'ops@test.dev',
    '+1-555-0100',
    now,
    now,
  );

  await db.run(
    `INSERT INTO projects (id, company_id, name, status, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
    PROJECT_ID,
    COMPANY_ID,
    'Test Project',
    'ACTIVE',
    now,
    now,
  );
});

test('returns an empty client list for a new company', async () => {
  const response = await jsonRequest('GET', `/companies/${COMPANY_ID}/clients`);
  assert.equal(response.status, 200);
  assert.deepEqual(response.body, []);
});

test('creates and retrieves a client with valid payload', async () => {
  const response = await jsonRequest('POST', `/companies/${COMPANY_ID}/clients`, {
    name: 'Alpha Developments',
    contactEmail: 'contact@alpha.dev',
    contactPerson: 'Taylor Finch',
    paymentTerms: 'Net 45',
  });

  assert.equal(response.status, 201);
  assert.ok(response.body.id);
  assert.equal(response.body.name, 'Alpha Developments');
  assert.equal(response.body.companyId, COMPANY_ID);
});

test('rejects invalid client payloads', async () => {
  const response = await jsonRequest('POST', `/companies/${COMPANY_ID}/clients`, {
    contactEmail: 'missing-name@example.com',
  });

  assert.equal(response.status, 400);
  assert.equal(response.body.error, 'Invalid client payload');
});

test('updates an existing client and toggles activity', async () => {
  const createResponse = await jsonRequest('POST', `/companies/${COMPANY_ID}/clients`, {
    name: 'Beta Retail',
    contactEmail: 'hello@beta-retail.com',
  });

  const clientId = createResponse.body.id;
  assert.ok(clientId);

  const updateResponse = await jsonRequest('PUT', `/clients/${clientId}`, {
    paymentTerms: 'Net 60',
    isActive: false,
  });

  assert.equal(updateResponse.status, 200);
  assert.equal(updateResponse.body.paymentTerms, 'Net 60');
  assert.equal(updateResponse.body.isActive, false);
});

test('requires at least one field when updating a client', async () => {
  const createResponse = await jsonRequest('POST', `/companies/${COMPANY_ID}/clients`, {
    name: 'Gamma Partners',
    contactEmail: 'team@gammapartners.com',
  });

  const clientId = createResponse.body.id;
  const response = await jsonRequest('PUT', `/clients/${clientId}`);

  assert.equal(response.status, 400);
  assert.equal(response.body.error, 'No update fields provided');
});

test('rejects invoices where due date precedes issue date', async () => {
  const clientResponse = await jsonRequest('POST', `/companies/${COMPANY_ID}/clients`, {
    name: 'Delta Housing',
    contactEmail: 'finance@delta.com',
  });

  const clientId = clientResponse.body.id;
  const response = await jsonRequest('POST', `/companies/${COMPANY_ID}/invoices`, {
    clientId,
    projectId: PROJECT_ID,
    issuedAt: '2024-05-01T00:00:00.000Z',
    dueAt: '2024-04-01T00:00:00.000Z',
    status: 'DRAFT',
    taxRate: 0.2,
    retentionRate: 0,
    lineItems: [
      {
        description: 'Mobilisation',
        quantity: 1,
        unitPrice: 1000,
      },
    ],
  });

  assert.equal(response.status, 400);
  assert.equal(response.body.error, 'Due date cannot be before issue date');
});

test('prevents recording payments that exceed the outstanding balance', async () => {
  const clientResponse = await jsonRequest('POST', `/companies/${COMPANY_ID}/clients`, {
    name: 'Epsilon Fabricators',
    contactEmail: 'accounts@epsilon.io',
  });
  const clientId = clientResponse.body.id;

  const invoiceResponse = await jsonRequest('POST', `/companies/${COMPANY_ID}/invoices`, {
    clientId,
    projectId: PROJECT_ID,
    issuedAt: '2024-05-01T00:00:00.000Z',
    dueAt: '2024-05-30T00:00:00.000Z',
    status: 'DRAFT',
    taxRate: 0.2,
    retentionRate: 0,
    lineItems: [
      {
        description: 'Mobilisation',
        quantity: 1,
        unitPrice: 1000,
      },
    ],
  });

  assert.equal(invoiceResponse.status, 201);
  const invoiceId = invoiceResponse.body.id;

  const paymentResponse = await jsonRequest('POST', `/invoices/${invoiceId}/payments`, {
    amount: 5000,
    method: 'BANK_TRANSFER',
  });

  assert.equal(paymentResponse.status, 400);
  assert.equal(
    paymentResponse.body.error,
    'Payment amount exceeds outstanding balance',
  );
});
