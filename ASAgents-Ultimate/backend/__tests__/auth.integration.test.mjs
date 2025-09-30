import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { once } from 'node:events';
import { fileURLToPath, pathToFileURL } from 'node:url';

process.env.NODE_ENV = 'test';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const testDbFile = path.resolve(__dirname, '../data/test-auth.db');
process.env.DATABASE_FILE = testDbFile;

const serverModule = await import(pathToFileURL(path.resolve(__dirname, '../server.js')).href);
const databaseModule = await import(pathToFileURL(path.resolve(__dirname, '../database.js')).href);

const { app } = serverModule;
const { getDatabase, initialiseSchema } = databaseModule;

const BASE_COMPANY_ID = 'tenant-auth';
const BASE_USER_ID = 'user-auth';
const BASE_PASSWORD = 'Passw0rd!';

const hashPassword = (value) => crypto.createHash('sha256').update(value).digest('hex');

let db;
let server;
let baseUrl;

const jsonRequest = async (method, url, body, headers = {}) => {
  const response = await fetch(`${baseUrl}${url}`, {
    method,
    headers: {
      'content-type': 'application/json',
      ...headers,
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
     VALUES (?, ?, ?, ?, ?, ?, 'ACTIVE', 'PROFESSIONAL', ?, ?)`,
    BASE_COMPANY_ID,
    'Auth Corp',
    'GENERAL_CONTRACTOR',
    'team@authcorp.dev',
    '+1-555-0100',
    'Construction',
    now,
    now,
  );

  await db.run(
    `INSERT INTO users (id, company_id, name, email, role, username, password_hash, auth_provider, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    BASE_USER_ID,
    BASE_COMPANY_ID,
    'Existing User',
    'existing@authcorp.dev',
    'ADMIN',
    'existing.user',
    hashPassword(BASE_PASSWORD),
    'local',
    now,
    now,
  );
});

test('registers a new tenant with platform session', async () => {
  const response = await jsonRequest('POST', '/auth/register', {
    firstName: 'Nova',
    lastName: 'Builder',
    email: 'nova@newtenant.dev',
    password: 'Secure#2024',
    companySelection: 'create',
    companyName: 'Nova Structures',
    companyType: 'CONSULTANT',
    phone: '+1-555-2345',
  });

  assert.equal(response.status, 201);
  assert.ok(response.body?.token);
  assert.ok(response.body?.refreshToken);
  assert.equal(response.body?.user?.email, 'nova@newtenant.dev');
  assert.equal(response.body?.company?.name, 'Nova Structures');
  assert.ok(Array.isArray(response.body?.availableCompanies));
  assert.equal(response.body?.activeCompanyId, response.body?.company?.id);

  const userRecord = await db.get('SELECT * FROM users WHERE email = ?', 'nova@newtenant.dev');
  assert.equal(userRecord.role, 'OWNER');
  const sessionCount = await db.get('SELECT COUNT(*) as count FROM auth_sessions WHERE user_id = ?', userRecord.id);
  assert.equal(Number(sessionCount.count), 1);
});

test('prevents duplicate registration by email', async () => {
  const payload = {
    firstName: 'Nova',
    lastName: 'Builder',
    email: 'nova@dup.dev',
    password: 'Secure#2024',
    companySelection: 'create',
    companyName: 'Dup Co',
  };

  const first = await jsonRequest('POST', '/auth/register', payload);
  assert.equal(first.status, 201);

  const duplicate = await jsonRequest('POST', '/auth/register', payload);
  assert.equal(duplicate.status, 409);
  assert.match(duplicate.body?.error ?? '', /already exists/i);
});

test('logs in an existing local account', async () => {
  const response = await jsonRequest('POST', '/auth/login', {
    email: 'existing@authcorp.dev',
    password: BASE_PASSWORD,
  });

  assert.equal(response.status, 200);
  assert.ok(response.body?.token);
  assert.equal(response.body?.user?.email, 'existing@authcorp.dev');
  assert.ok(Array.isArray(response.body?.availableCompanies));
  assert.equal(response.body?.activeCompanyId, response.body?.company?.id);
});

test('supports social login and creates company when needed', async () => {
  const response = await jsonRequest('POST', '/auth/social', {
    provider: 'google',
    token: 'google-token-123456',
    email: 'connect@socialauth.dev',
    firstName: 'Social',
    lastName: 'Connector',
    companySelection: 'create',
    companyName: 'Social Auth Labs',
  });

  assert.equal(response.status, 201);
  assert.ok(response.body?.token);
  assert.equal(response.body?.user?.email, 'connect@socialauth.dev');
  assert.equal(response.body?.provider, 'google');
  assert.ok(Array.isArray(response.body?.availableCompanies));
  assert.equal(response.body?.activeCompanyId, response.body?.company?.id);

  const stored = await db.get('SELECT * FROM users WHERE email = ?', 'connect@socialauth.dev');
  assert.equal(stored.auth_provider, 'google');
  const company = await db.get('SELECT * FROM companies WHERE id = ?', stored.company_id);
  assert.equal(company.name, 'Social Auth Labs');
});

test('refresh token rotates access token', async () => {
  const login = await jsonRequest('POST', '/auth/login', {
    email: 'existing@authcorp.dev',
    password: BASE_PASSWORD,
  });

  assert.equal(login.status, 200);
  const refreshToken = login.body.refreshToken;
  const previousToken = login.body.token;

  const refreshed = await jsonRequest('POST', '/auth/refresh', { refreshToken });
  assert.equal(refreshed.status, 200);
  assert.ok(refreshed.body?.token);
  assert.notEqual(refreshed.body.token, previousToken);
});

test('principal admin can enumerate and switch tenants', async () => {
  const now = new Date().toISOString();
  await db.run(
    `INSERT INTO companies (id, name, type, email, phone, industry, status, subscription_plan, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, 'ACTIVE', 'ENTERPRISE', ?, ?)`,
    'platform-root',
    'Platform Control',
    'PLATFORM',
    'root@platform.dev',
    '+1-555-9999',
    'Technology',
    now,
    now,
  );

  await db.run(
    `INSERT INTO users (id, company_id, name, email, role, username, password_hash, auth_provider, is_platform_owner, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'local', 1, ?, ?)`,
    'platform-admin',
    'platform-root',
    'Platform Root',
    'root@platform.dev',
    'PRINCIPAL_ADMIN',
    'platform.root',
    hashPassword('Admin#2024'),
    now,
    now,
  );

  const login = await jsonRequest('POST', '/auth/login', {
    email: 'root@platform.dev',
    password: 'Admin#2024',
  });

  assert.equal(login.status, 200);
  assert.equal(login.body.activeCompanyId, 'platform-root');
  assert.ok(Array.isArray(login.body.availableCompanies));
  const token = login.body.token;

  const tenants = await jsonRequest('GET', '/auth/tenants', undefined, {
    Authorization: `Bearer ${token}`,
  });

  assert.equal(tenants.status, 200);
  assert.ok(tenants.body?.companies?.some((entry) => entry.id === BASE_COMPANY_ID));

  const switched = await jsonRequest('POST', '/auth/switch-company', { companyId: BASE_COMPANY_ID }, {
    Authorization: `Bearer ${token}`,
  });

  assert.equal(switched.status, 200);
  assert.equal(switched.body?.company?.id, BASE_COMPANY_ID);
  assert.equal(switched.body?.activeCompanyId, BASE_COMPANY_ID);

  const session = await jsonRequest('GET', '/auth/me', undefined, {
    Authorization: `Bearer ${token}`,
  });

  assert.equal(session.status, 200);
  assert.equal(session.body?.activeCompanyId, BASE_COMPANY_ID);
  assert.equal(session.body?.company?.id, BASE_COMPANY_ID);
});

test('me endpoint returns session details with valid token', async () => {
  const login = await jsonRequest('POST', '/auth/login', {
    email: 'existing@authcorp.dev',
    password: BASE_PASSWORD,
  });
  const token = login.body.token;

  const response = await jsonRequest('GET', '/auth/me', undefined, {
    authorization: `Bearer ${token}`,
  });

  assert.equal(response.status, 200);
  assert.equal(response.body?.user?.email, 'existing@authcorp.dev');
  assert.equal(response.body?.company?.id, BASE_COMPANY_ID);
});

test('logout revokes the active session', async () => {
  const login = await jsonRequest('POST', '/auth/login', {
    email: 'existing@authcorp.dev',
    password: BASE_PASSWORD,
  });
  const token = login.body.token;

  const logout = await jsonRequest('POST', '/auth/logout', undefined, {
    authorization: `Bearer ${token}`,
  });
  assert.equal(logout.status, 204);

  const after = await jsonRequest('GET', '/auth/me', undefined, {
    authorization: `Bearer ${token}`,
  });
  assert.equal(after.status, 401);
});
