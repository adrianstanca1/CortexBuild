import express from 'express';
import cors from 'cors';
import crypto from 'crypto';
import { initialiseSchema, getDatabase, PLATFORM_COMPANY_ID } from './database.js';
import { z } from 'zod';
import { v4 as uuid } from 'uuid';

export const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

const PORT = process.env.PORT || 4000;

const paymentMethods = Object.freeze(['BANK_TRANSFER', 'CREDIT_CARD', 'CASH', 'CHECK']);
const invoiceStatuses = Object.freeze(['DRAFT', 'SENT', 'OVERDUE', 'PAID', 'CANCELLED']);

const createErrorPayload = (message, extra = {}) => ({
  error: message,
  message,
  timestamp: new Date().toISOString(),
  ...extra,
});

const isoDateSchema = z.string().refine((value) => {
  const timestamp = new Date(value).getTime();
  return Number.isFinite(timestamp);
}, 'Invalid date value');

const clientSchema = z.object({
  name: z.string().min(1),
  contactPerson: z.string().optional(),
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  billingAddress: z.string().optional(),
  paymentTerms: z.string().optional(),
  isActive: z.boolean().optional(),
  address: z
    .object({
      street: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      zipCode: z.string().optional(),
      country: z.string().optional(),
    })
    .optional(),
});

const invoiceLineItemSchema = z.object({
  description: z.string().min(1),
  quantity: z.number().positive(),
  unitPrice: z.number().min(0),
});

const invoiceSchema = z.object({
  clientId: z.string().min(1),
  projectId: z.string().min(1),
  issuedAt: isoDateSchema,
  dueAt: isoDateSchema,
  status: z.enum(invoiceStatuses),
  notes: z.string().optional(),
  taxRate: z.number().min(0),
  retentionRate: z.number().min(0),
  lineItems: z.array(invoiceLineItemSchema).min(1),
});

const invoiceUpdateSchema = invoiceSchema.partial().extend({
  status: z.enum(invoiceStatuses).optional(),
  lineItems: z.array(invoiceLineItemSchema).min(1).optional(),
});

const paymentSchema = z.object({
  amount: z.number().positive(),
  method: z.enum(paymentMethods),
  reference: z.string().optional(),
  notes: z.string().optional(),
});

const switchCompanySchema = z.object({
  companyId: z.string().min(1),
});

const ensureInvoiceDatesValid = (issuedAt, dueAt) => {
  if (!issuedAt || !dueAt) {
    return true;
  }
  const issued = new Date(issuedAt).getTime();
  const due = new Date(dueAt).getTime();
  if (!Number.isFinite(issued) || !Number.isFinite(due)) {
    return false;
  }
  return due >= issued;
};

const getQuarterStartIso = (reference = new Date()) => {
  const quarterIndex = Math.floor(reference.getUTCMonth() / 3);
  const start = new Date(Date.UTC(reference.getUTCFullYear(), quarterIndex * 3, 1));
  return start.toISOString();
};

const getYearStartIso = (reference = new Date()) => {
  const start = new Date(Date.UTC(reference.getUTCFullYear(), 0, 1));
  return start.toISOString();
};

const mapCompanyRow = (row) => ({
  id: row.id,
  name: row.name,
  type: row.type ?? 'GENERAL_CONTRACTOR',
  email: row.email ?? '',
  phone: row.phone ?? '',
  industry: row.industry ?? '',
  status: row.status ?? 'ACTIVE',
  subscriptionPlan: row.subscription_plan ?? 'PROFESSIONAL',
  isActive: (row.status ?? 'ACTIVE').toUpperCase() === 'ACTIVE',
  storageUsageGB: Number.parseFloat(row.storage_usage_gb ?? 0) || 0,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const defaultUserPreferences = Object.freeze({
  theme: 'system',
  language: 'en',
  notifications: {
    email: true,
    push: true,
    sms: false,
    taskReminders: true,
    projectUpdates: true,
    systemAlerts: true,
  },
  dashboard: {
    defaultView: 'dashboard',
    pinnedWidgets: [],
    hiddenWidgets: [],
  },
});

const mapUserRow = (row) => {
  const name = row.name ?? '';
  const [firstName, ...rest] = name.trim().split(' ');
  return {
    id: row.id,
    firstName: firstName ?? '',
    lastName: rest.join(' ') || '',
    email: row.email,
    role: row.role,
    companyId: row.company_id,
    primaryCompanyId: row.company_id,
    username: row.username ?? undefined,
    isActive: true,
    isEmailVerified: true,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    lastLogin: row.updated_at,
    permissions: [],
    preferences: defaultUserPreferences,
  };
};

const isPlatformOperator = (userRow) => Boolean(userRow?.is_platform_owner) || userRow?.role === 'PRINCIPAL_ADMIN';

const resolveCompanyAccess = async (db, userRow, requestedActiveCompanyId) => {
  if (!userRow) {
    const error = new Error('User record not found');
    error.status = 404;
    throw error;
  }

  const platformOperator = isPlatformOperator(userRow);
  let candidateCompanies;

  if (platformOperator) {
    candidateCompanies = await db.all('SELECT * FROM companies ORDER BY name COLLATE NOCASE');
  } else {
    const company = await db.get('SELECT * FROM companies WHERE id = ?', userRow.company_id);
    if (!company) {
      const error = new Error('Company not found for user');
      error.status = 400;
      throw error;
    }
    candidateCompanies = [company];
  }

  if (!candidateCompanies || candidateCompanies.length === 0) {
    const error = new Error('No companies available for session');
    error.status = 400;
    throw error;
  }

  const requestedId = requestedActiveCompanyId ?? userRow.company_id ?? candidateCompanies[0].id;
  const activeCandidate = candidateCompanies.find((company) => company.id === requestedId)
    ?? candidateCompanies.find((company) => company.id === userRow.company_id)
    ?? candidateCompanies[0];

  const entries = candidateCompanies.map((company) => ({
    id: company.id,
    name: company.name,
    status: company.status ?? 'ACTIVE',
    subscriptionPlan: company.subscription_plan ?? 'PROFESSIONAL',
    membershipRole: platformOperator ? 'PLATFORM_ADMIN' : userRow.role,
    membershipType:
      company.id === userRow.company_id
        ? 'primary'
        : company.id === PLATFORM_COMPANY_ID
        ? 'platform'
        : 'delegated',
    isPlatform: company.id === PLATFORM_COMPANY_ID,
    isPrimary: company.id === userRow.company_id,
  }));

  return {
    entries,
    activeCompanyRow: activeCandidate,
    activeCompanyId: activeCandidate.id,
  };
};

const buildSessionState = async (db, userRow, activeCompanyId) => {
  const access = await resolveCompanyAccess(db, userRow, activeCompanyId);
  const userPayload = mapUserRow(userRow);
  if (access.activeCompanyId && access.activeCompanyId !== userRow.company_id) {
    userPayload.companyId = access.activeCompanyId;
  }

  return {
    user: userPayload,
    company: mapCompanyRow(access.activeCompanyRow),
    availableCompanies: access.entries,
    activeCompanyId: access.activeCompanyId,
  };
};

const USER_ROLES = [
  'OWNER',
  'ADMIN',
  'PROJECT_MANAGER',
  'FOREMAN',
  'OPERATIVE',
  'CLIENT',
  'PRINCIPAL_ADMIN',
];

const COMPANY_TYPES = [
  'GENERAL_CONTRACTOR',
  'SUBCONTRACTOR',
  'SUPPLIER',
  'CONSULTANT',
  'CLIENT',
];

const SOCIAL_PROVIDERS = ['google', 'facebook'];

const SESSION_TTL_MS = 30 * 60 * 1000; // 30 minutes
const REFRESH_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

const normaliseEmail = (email) => email.trim().toLowerCase();
const buildFullName = (firstName, lastName) => [firstName, lastName].filter(Boolean).join(' ').trim();

const hashPassword = (value) => crypto.createHash('sha256').update(value).digest('hex');
const verifyPassword = (value, hash) => {
  if (!hash) {
    return false;
  }
  return hashPassword(value) === hash;
};

const usernameFromNames = (firstName, lastName) => {
  const raw = [firstName, lastName].filter(Boolean).join('.').toLowerCase();
  const cleaned = raw.replace(/[^a-z0-9.]/g, '');
  return cleaned || `user.${Math.random().toString(36).slice(2, 8)}`;
};

const ensureUniqueUsername = async (db, desiredBase) => {
  const base = desiredBase && desiredBase.length > 0 ? desiredBase : 'user';
  let candidate = base;
  let suffix = 1;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const existing = await db.get('SELECT 1 FROM users WHERE username = ?', candidate);
    if (!existing) {
      return candidate;
    }
    candidate = `${base}.${suffix}`;
    suffix += 1;
  }
};

const fetchUserWithCompany = async (db, userId, companyIdOverride) => {
  const user = await db.get('SELECT * FROM users WHERE id = ?', userId);
  if (!user) {
    const error = new Error('User not found');
    error.status = 404;
    throw error;
  }

  const primaryCompany = await db.get('SELECT * FROM companies WHERE id = ?', user.company_id);
  if (!primaryCompany) {
    const error = new Error('Company not found for user');
    error.status = 400;
    throw error;
  }

  let company = primaryCompany;
  if (companyIdOverride && companyIdOverride !== primaryCompany.id) {
    const override = await db.get('SELECT * FROM companies WHERE id = ?', companyIdOverride);
    if (!override) {
      const error = new Error('Company not found for session context');
      error.status = 404;
      throw error;
    }
    company = override;
  }

  return { user, company, primaryCompany };
};

const createAuthSession = async (db, userId, provider = 'local', activeCompanyId) => {
  const id = uuid();
  const token = crypto.randomBytes(48).toString('hex');
  const refreshToken = crypto.randomBytes(64).toString('hex');
  const now = Date.now();
  const expiresAt = new Date(now + SESSION_TTL_MS).toISOString();
  const refreshExpiresAt = new Date(now + REFRESH_TTL_MS).toISOString();
  const resolvedActiveCompany = activeCompanyId ?? null;

  await db.run(
    `INSERT INTO auth_sessions (id, user_id, token, refresh_token, provider, expires_at, refresh_expires_at, active_company_id, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
    id,
    userId,
    token,
    refreshToken,
    provider,
    expiresAt,
    refreshExpiresAt,
    resolvedActiveCompany,
  );

  return { id, token, refreshToken, expiresAt, refreshExpiresAt, activeCompanyId: resolvedActiveCompany };
};

const issueAuthSuccess = async (db, userId, provider = 'local', activeCompanyId) => {
  const userRecord = await db.get('SELECT * FROM users WHERE id = ?', userId);
  if (!userRecord) {
    const error = new Error('User not found');
    error.status = 404;
    throw error;
  }

  const session = await createAuthSession(db, userId, provider, activeCompanyId ?? userRecord.company_id);
  const state = await buildSessionState(db, userRecord, session.activeCompanyId ?? userRecord.company_id);

  return {
    token: session.token,
    refreshToken: session.refreshToken,
    expiresAt: session.expiresAt,
    refreshExpiresAt: session.refreshExpiresAt,
    provider,
    ...state,
  };
};

const ensureCompanyForRegistration = async (db, payload) => {
  const selection = payload.companySelection ?? 'create';
  const nowIso = new Date().toISOString();

  if (selection === 'create') {
    const name = (payload.companyName ?? `${payload.firstName ?? 'New'} ${payload.lastName ?? 'Team'} Builders`).trim();
    const companyId = uuid();

    await db.run(
      `INSERT INTO companies (id, name, type, email, phone, industry, status, subscription_plan, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, 'ACTIVE', 'PROFESSIONAL', ?, ?)`,
      companyId,
      name,
      payload.companyType && COMPANY_TYPES.includes(payload.companyType) ? payload.companyType : 'GENERAL_CONTRACTOR',
      payload.companyEmail ?? payload.email,
      payload.companyPhone ?? '',
      payload.companyIndustry ?? 'General',
      nowIso,
      nowIso,
    );

    const company = await db.get('SELECT * FROM companies WHERE id = ?', companyId);
    return { companyId, company };
  }

  if (selection === 'join') {
    let companyId = payload.companyId;
    if (!companyId && payload.inviteToken === 'JOIN-CONSTRUCTCO') {
      const constructCo = await db.get('SELECT id FROM companies WHERE id = ?', '1');
      if (constructCo) {
        companyId = constructCo.id;
      }
    }

    if (!companyId) {
      const error = new Error('A valid company reference or invite token is required.');
      error.status = 400;
      throw error;
    }

    const company = await db.get('SELECT * FROM companies WHERE id = ?', companyId);
    if (!company) {
      const error = new Error('Company not found for the provided reference.');
      error.status = 404;
      throw error;
    }

    return { companyId, company };
  }

  return ensureCompanyForRegistration(db, { ...payload, companySelection: 'create' });
};

const createUserRecord = async (
  db,
  { firstName, lastName, email, password, companyId, role, provider = 'local', phone, isPlatformOwner = false },
) => {
  const id = uuid();
  const nowIso = new Date().toISOString();
  const usernameBase = usernameFromNames(firstName, lastName);
  const username = await ensureUniqueUsername(db, usernameBase);

  await db.run(
    `INSERT INTO users (id, company_id, name, email, role, username, password_hash, auth_provider, is_platform_owner, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    id,
    companyId,
    buildFullName(firstName, lastName),
    normaliseEmail(email),
    USER_ROLES.includes(role) ? role : 'OPERATIVE',
    username,
    password ? hashPassword(password) : null,
    provider,
    isPlatformOwner ? 1 : 0,
    nowIso,
    nowIso,
  );

  return id;
};

const updateUserAuthMetadata = async (db, userId, provider) => {
  await db.run(
    `UPDATE users SET updated_at = datetime('now'), auth_provider = ? WHERE id = ?`,
    provider,
    userId,
  );
};

const requireSession = async (req) => {
  const header = req.headers.authorization ?? req.get('authorization');
  if (!header) {
    const error = new Error('Missing authorization header.');
    error.status = 401;
    throw error;
  }

  const match = header.match(/Bearer\s+(.+)/i);
  if (!match) {
    const error = new Error('Malformed authorization header.');
    error.status = 401;
    throw error;
  }

  const token = match[1].trim();
  if (!token) {
    const error = new Error('Missing session token.');
    error.status = 401;
    throw error;
  }

  const db = await getDatabase();
  const session = await db.get('SELECT * FROM auth_sessions WHERE token = ?', token);
  if (!session) {
    const error = new Error('Invalid or expired session.');
    error.status = 401;
    throw error;
  }

  if (new Date(session.expires_at).getTime() <= Date.now()) {
    await db.run('DELETE FROM auth_sessions WHERE id = ?', session.id);
    const error = new Error('Session has expired.');
    error.status = 401;
    throw error;
  }

  await db.run('UPDATE auth_sessions SET updated_at = datetime(\'now\') WHERE id = ?', session.id);

  return { db, session };
};

const mapClientRow = (row) => ({
  id: row.id,
  name: row.name,
  email: row.email ?? '',
  phone: row.phone ?? '',
  contactPerson: row.contact_person ?? '',
  contactEmail: row.contact_email ?? row.email ?? '',
  contactPhone: row.contact_phone ?? row.phone ?? '',
  billingAddress: row.billing_address ?? '',
  paymentTerms: row.payment_terms ?? 'Net 30',
  companyId: row.company_id,
  isActive: Boolean(row.is_active),
  createdAt: row.created_at,
  updatedAt: row.updated_at,
  address: {
    street: row.street ?? '',
    city: row.city ?? '',
    state: row.state ?? '',
    zipCode: row.zip_code ?? '',
    country: row.country ?? '',
  },
});

const mapProjectRow = (row) => ({
  id: row.id,
  name: row.name,
  description: row.description ?? '',
  status: row.status ?? 'PLANNING',
  budget: Number(row.budget ?? 0),
  spent: Number(row.spent ?? 0),
  actualCost: Number(row.actual_cost ?? 0),
  startDate: row.start_date ?? '',
  endDate: row.end_date ?? '',
  location: {
    address: row.address ?? '',
    lat: Number(row.lat ?? 0),
    lng: Number(row.lng ?? 0),
  },
  clientId: row.client_id ?? '',
  managerId: row.manager_id ?? '',
  image: undefined,
  progress: Number(row.progress ?? 0),
  companyId: row.company_id,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
  projectType: row.project_type ?? 'General',
  workClassification: row.work_classification ?? 'General',
});

const mapInvoiceRow = async (db, row) => {
  const lineItems = await db.all(
    'SELECT id, description, quantity, unit_price as unitPrice, amount, created_at, updated_at FROM invoice_line_items WHERE invoice_id = ? ORDER BY created_at ASC',
    row.id,
  );

  const payments = await db.all(
    'SELECT id, amount, method, reference, notes, created_by as createdBy, created_at as createdAt FROM invoice_payments WHERE invoice_id = ? ORDER BY created_at ASC',
    row.id,
  );

  return {
    id: row.id,
    invoiceNumber: row.invoice_number,
    projectId: row.project_id ?? '',
    clientId: row.client_id,
    issueDate: row.issue_date ?? row.created_at,
    issuedAt: row.issue_date ?? row.created_at,
    dueDate: row.due_date ?? row.created_at,
    dueAt: row.due_date ?? row.created_at,
    status: row.status,
    lineItems: lineItems.map((item) => ({
      id: item.id,
      description: item.description,
      quantity: Number(item.quantity),
      rate: Number(item.unitPrice),
      unitPrice: Number(item.unitPrice),
      amount: Number(item.amount),
    })),
    subtotal: Number(row.subtotal ?? 0),
    taxRate: Number(row.tax_rate ?? 0),
    taxAmount: Number(row.tax_amount ?? 0),
    retentionRate: Number(row.retention_rate ?? 0),
    retentionAmount: Number(row.retention_amount ?? 0),
    total: Number(row.total ?? 0),
    amountPaid: Number(row.amount_paid ?? 0),
    balance: Number(row.balance ?? 0),
    notes: row.notes ?? '',
    payments: payments.map((payment) => ({
      id: payment.id,
      invoiceId: row.id,
      amount: Number(payment.amount),
      date: payment.createdAt,
      method: payment.method,
      reference: payment.reference ?? undefined,
      notes: payment.notes ?? undefined,
      createdBy: payment.createdBy,
      createdAt: payment.createdAt,
    })),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

const buildTenantSummaries = async (db) => {
  const companies = await db.all('SELECT * FROM companies ORDER BY created_at ASC');
  if (!companies.length) {
    return [];
  }

  const userCounts = await db.all(
    'SELECT company_id as companyId, COUNT(*) as count FROM users GROUP BY company_id',
  );
  const projectCounts = await db.all(
    'SELECT company_id as companyId, status, COUNT(*) as count FROM projects GROUP BY company_id, status',
  );
  const invoiceSummaries = await db.all(
    'SELECT company_id as companyId, status, SUM(total) as total, SUM(balance) as balance FROM invoices GROUP BY company_id, status',
  );

  const userCountMap = new Map(userCounts.map((row) => [row.companyId, Number(row.count)]));

  const projectSummaryMap = new Map();
  for (const row of projectCounts) {
    const entry = projectSummaryMap.get(row.companyId) ?? { total: 0, active: 0 };
    entry.total += Number(row.count ?? 0);
    if (row.status === 'ACTIVE' || row.status === 'IN_PROGRESS') {
      entry.active += Number(row.count ?? 0);
    }
    projectSummaryMap.set(row.companyId, entry);
  }

  const invoiceSummaryMap = new Map();
  for (const row of invoiceSummaries) {
    const entry =
      invoiceSummaryMap.get(row.companyId) ??
      { totalRevenue: 0, outstandingBalance: 0, overdueInvoices: 0, collectedRevenue: 0 };
    const total = Number(row.total ?? 0);
    const balance = Number(row.balance ?? 0);
    entry.totalRevenue += total;
    entry.outstandingBalance += balance;
    if (row.status === 'OVERDUE') {
      entry.overdueInvoices += 1;
    }
    if (row.status === 'PAID') {
      entry.collectedRevenue += total;
    }
    invoiceSummaryMap.set(row.companyId, entry);
  }

  return companies
    .filter((company) => company.id !== PLATFORM_COMPANY_ID)
    .map((company) => {
      const base = mapCompanyRow(company);
      const projectSummary = projectSummaryMap.get(company.id) ?? { total: 0, active: 0 };
      const invoiceSummary =
        invoiceSummaryMap.get(company.id) ??
        { totalRevenue: 0, outstandingBalance: 0, overdueInvoices: 0, collectedRevenue: 0 };

      return {
        ...base,
        totalUsers: userCountMap.get(company.id) ?? 0,
        totalProjects: projectSummary.total,
        activeProjects: projectSummary.active,
        totalRevenue: invoiceSummary.totalRevenue,
        outstandingBalance: invoiceSummary.outstandingBalance,
        overdueInvoices: invoiceSummary.overdueInvoices,
        collectedRevenue: invoiceSummary.collectedRevenue,
      };
    });
};

const companySelectionSchema = z.enum(['create', 'join']);
const roleSchema = z.enum(USER_ROLES);
const companyTypeSchema = z.enum(COMPANY_TYPES);
const socialProviderSchema = z.enum(SOCIAL_PROVIDERS);

const registrationSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
  phone: z.string().optional(),
  companySelection: companySelectionSchema.optional(),
  companyName: z.string().optional(),
  companyType: companyTypeSchema.optional(),
  companyEmail: z.string().email().optional(),
  companyPhone: z.string().optional(),
  companyWebsite: z.string().optional(),
  companyIndustry: z.string().optional(),
  inviteToken: z.string().optional(),
  companyId: z.string().optional(),
  role: roleSchema.optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const socialAuthSchema = registrationSchema
  .omit({ password: true })
  .extend({
    provider: socialProviderSchema,
    token: z.string().min(6),
  });

const refreshSchema = z.object({
  refreshToken: z.string().min(10),
});

const calculatePlatformMetrics = async (db) => {
  const [{ count: companyCount = 0 } = { count: 0 }] = await db.all(
    'SELECT COUNT(*) as count FROM companies WHERE id != ?',
    PLATFORM_COMPANY_ID,
  );
  const [{ count: projectCount = 0 } = { count: 0 }] = await db.all(
    "SELECT COUNT(*) as count FROM projects WHERE status IN ('ACTIVE', 'IN_PROGRESS')",
  );
  const [{ total = 0, balance = 0 } = { total: 0, balance: 0 }] = await db.all(
    'SELECT SUM(total) as total, SUM(balance) as balance FROM invoices',
  );
  const [{ count: userCount = 0 } = { count: 0 }] = await db.all(
    'SELECT COUNT(*) as count FROM users WHERE company_id != ?',
    PLATFORM_COMPANY_ID,
  );
  const platformOwner = await db.get(
    'SELECT username, email, name FROM users WHERE is_platform_owner = 1 ORDER BY created_at ASC LIMIT 1',
  );

  return {
    source: 'backend',
    metrics: [
      { name: 'Active Tenants', value: Number(companyCount), unit: 'companies' },
      { name: 'Active Projects', value: Number(projectCount), unit: 'projects' },
      { name: 'Total Invoice Value', value: Number(total), unit: 'GBP' },
      { name: 'Outstanding Balance', value: Number(balance), unit: 'GBP' },
      { name: 'Verified Users', value: Number(userCount), unit: 'users' },
    ],
    generatedAt: new Date().toISOString(),
    platformOwner: platformOwner
      ? {
          username: platformOwner.username,
          email: platformOwner.email,
          name: platformOwner.name,
        }
      : null,
  };
};

app.post('/auth/register', async (req, res) => {
  const parseResult = registrationSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res
      .status(400)
      .json(createErrorPayload('Invalid registration payload', { issues: parseResult.error.flatten() }));
  }

  const payload = parseResult.data;

  try {
    const db = await getDatabase();
    const email = normaliseEmail(payload.email);
    const existing = await db.get('SELECT id FROM users WHERE email = ?', email);
    if (existing) {
      return res.status(409).json(createErrorPayload('An account with this email already exists.'));
    }

    const selection = payload.companySelection ?? 'create';
    const { companyId } = await ensureCompanyForRegistration(db, { ...payload, email });
    const role = payload.role && USER_ROLES.includes(payload.role)
      ? payload.role
      : selection === 'create'
      ? 'OWNER'
      : 'OPERATIVE';

    const userId = await createUserRecord(db, {
      firstName: payload.firstName,
      lastName: payload.lastName,
      email,
      password: payload.password,
      companyId,
      role,
      provider: 'local',
      phone: payload.phone,
    });

    await updateUserAuthMetadata(db, userId, 'local');
    const response = await issueAuthSuccess(db, userId, 'local', companyId);
    res.status(201).json(response);
  } catch (error) {
    const status = typeof error.status === 'number' ? error.status : 500;
    const message = status === 500 ? 'Unable to complete registration' : error.message;
    res.status(status).json(createErrorPayload(message, status === 500 ? { details: error.message } : undefined));
  }
});

app.post('/auth/login', async (req, res) => {
  const parseResult = loginSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json(createErrorPayload('Invalid login payload', { issues: parseResult.error.flatten() }));
  }

  const { email, password } = parseResult.data;

  try {
    const db = await getDatabase();
    const user = await db.get('SELECT * FROM users WHERE email = ?', normaliseEmail(email));
    if (!user) {
      return res.status(401).json(createErrorPayload('Invalid credentials'));
    }

    if (user.auth_provider && user.auth_provider !== 'local' && !user.password_hash) {
      return res
        .status(409)
        .json(
          createErrorPayload('This account is linked to a social provider. Please continue with your social login.'),
        );
    }

    if (!verifyPassword(password, user.password_hash)) {
      return res.status(401).json(createErrorPayload('Invalid credentials'));
    }

    await updateUserAuthMetadata(db, user.id, 'local');
    const response = await issueAuthSuccess(db, user.id, 'local', user.company_id);
    res.json(response);
  } catch (error) {
    res.status(500).json(createErrorPayload('Unable to sign in', { details: error.message }));
  }
});

app.post('/auth/social', async (req, res) => {
  const parseResult = socialAuthSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json(createErrorPayload('Invalid social login payload', { issues: parseResult.error.flatten() }));
  }

  const payload = parseResult.data;
  const email = normaliseEmail(payload.email);
  const provider = payload.provider;

  try {
    const db = await getDatabase();
    const existing = await db.get('SELECT * FROM users WHERE email = ?', email);
    let userId;
    let statusCode = 200;
    let activeCompanyId;

    if (existing) {
      userId = existing.id;
      activeCompanyId = existing.company_id;
      await updateUserAuthMetadata(db, userId, provider);
    } else {
      const firstName = payload.firstName ?? email.split('@')[0];
      const lastName = payload.lastName ?? 'User';
      const selection = payload.companySelection ?? 'create';
      const { companyId } = await ensureCompanyForRegistration(db, {
        ...payload,
        email,
        firstName,
        lastName,
        companySelection: selection,
      });

      const role = payload.role && USER_ROLES.includes(payload.role)
        ? payload.role
        : selection === 'create'
        ? 'OWNER'
        : 'OPERATIVE';

      userId = await createUserRecord(db, {
        firstName,
        lastName,
        email,
        password: payload.token,
        companyId,
        role,
        provider,
        phone: payload.phone,
      });
      activeCompanyId = companyId;
      statusCode = 201;
    }

    const response = await issueAuthSuccess(db, userId, provider, activeCompanyId);
    res.status(statusCode).json(response);
  } catch (error) {
    const status = typeof error.status === 'number' ? error.status : 500;
    const message = status === 500 ? 'Unable to process social login' : error.message;
    res.status(status).json(createErrorPayload(message, status === 500 ? { details: error.message } : undefined));
  }
});

app.get('/auth/me', async (req, res) => {
  try {
    const { db, session } = await requireSession(req);
    const userRecord = await db.get('SELECT * FROM users WHERE id = ?', session.user_id);
    if (!userRecord) {
      return res.status(404).json(createErrorPayload('User not found'));
    }

    const state = await buildSessionState(db, userRecord, session.active_company_id ?? userRecord.company_id);
    res.json({
      ...state,
      provider: session.provider,
      expiresAt: session.expires_at,
    });
  } catch (error) {
    const status = typeof error.status === 'number' ? error.status : 500;
    const message = status === 500 ? 'Unable to verify session' : error.message;
    res.status(status).json(createErrorPayload(message, status === 500 ? { details: error.message } : undefined));
  }
});

app.get('/auth/tenants', async (req, res) => {
  try {
    const { db, session } = await requireSession(req);
    const userRecord = await db.get('SELECT * FROM users WHERE id = ?', session.user_id);
    if (!userRecord) {
      return res.status(404).json(createErrorPayload('User not found'));
    }

    const access = await resolveCompanyAccess(db, userRecord, session.active_company_id ?? userRecord.company_id);
    res.json({
      activeCompanyId: access.activeCompanyId,
      companies: access.entries,
    });
  } catch (error) {
    const status = typeof error.status === 'number' ? error.status : 500;
    const message = status === 500 ? 'Unable to load tenant list' : error.message;
    res.status(status).json(createErrorPayload(message, status === 500 ? { details: error.message } : undefined));
  }
});

app.post('/auth/switch-company', async (req, res) => {
  const parseResult = switchCompanySchema.safeParse(req.body);
  if (!parseResult.success) {
    return res
      .status(400)
      .json(createErrorPayload('Invalid company switch payload', { issues: parseResult.error.flatten() }));
  }

  try {
    const { db, session } = await requireSession(req);
    const userRecord = await db.get('SELECT * FROM users WHERE id = ?', session.user_id);
    if (!userRecord) {
      return res.status(404).json(createErrorPayload('User not found'));
    }

    const desiredCompanyId = parseResult.data.companyId;
    const access = await resolveCompanyAccess(db, userRecord, session.active_company_id ?? userRecord.company_id);
    const allowed = access.entries.some((entry) => entry.id === desiredCompanyId);

    if (!allowed) {
      return res.status(403).json(createErrorPayload('You do not have access to this tenant'));
    }

    await db.run(
      `UPDATE auth_sessions SET active_company_id = ?, updated_at = datetime('now') WHERE id = ?`,
      desiredCompanyId,
      session.id,
    );

    const state = await buildSessionState(db, userRecord, desiredCompanyId);
    res.json(state);
  } catch (error) {
    const status = typeof error.status === 'number' ? error.status : 500;
    const message = status === 500 ? 'Unable to switch tenant' : error.message;
    res.status(status).json(createErrorPayload(message, status === 500 ? { details: error.message } : undefined));
  }
});

app.post('/auth/refresh', async (req, res) => {
  const parseResult = refreshSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res
      .status(400)
      .json(createErrorPayload('Invalid refresh payload', { issues: parseResult.error.flatten() }));
  }

  try {
    const db = await getDatabase();
    const session = await db.get('SELECT * FROM auth_sessions WHERE refresh_token = ?', parseResult.data.refreshToken);
    if (!session) {
      return res.status(401).json(createErrorPayload('Invalid refresh token'));
    }

    if (new Date(session.refresh_expires_at).getTime() <= Date.now()) {
      await db.run('DELETE FROM auth_sessions WHERE id = ?', session.id);
      return res.status(401).json(createErrorPayload('Refresh token expired'));
    }

    const token = crypto.randomBytes(48).toString('hex');
    const expiresAt = new Date(Date.now() + SESSION_TTL_MS).toISOString();

    await db.run(
      `UPDATE auth_sessions SET token = ?, expires_at = ?, updated_at = datetime('now') WHERE id = ?`,
      token,
      expiresAt,
      session.id,
    );

    res.json({ token, expiresAt });
  } catch (error) {
    res.status(500).json(createErrorPayload('Unable to refresh session', { details: error.message }));
  }
});

app.post('/auth/logout', async (req, res) => {
  try {
    const { db, session } = await requireSession(req);
    await db.run('DELETE FROM auth_sessions WHERE id = ?', session.id);
    res.status(204).send();
  } catch (error) {
    const status = typeof error.status === 'number' ? error.status : 500;
    const message = status === 500 ? 'Unable to log out' : error.message;
    res.status(status).json(createErrorPayload(message, status === 500 ? { details: error.message } : undefined));
  }
});

app.get('/health', async (_req, res) => {
  try {
    await initialiseSchema();
    res.json({ status: 'ok', mode: 'database', checkedAt: new Date().toISOString() });
  } catch (error) {
    res.status(500).json(createErrorPayload('Health check failed', { status: 'error', details: error.message }));
  }
});

app.get('/companies', async (_req, res) => {
  try {
    const db = await getDatabase();
    const rows = await db.all('SELECT * FROM companies ORDER BY created_at ASC');
    res.json(rows.map(mapCompanyRow));
  } catch (error) {
    res.status(500).json(createErrorPayload('Unable to list companies', { details: error.message }));
  }
});

app.get('/platform/tenants', async (_req, res) => {
  try {
    const db = await getDatabase();
    const summaries = await buildTenantSummaries(db);
    res.json({ source: 'backend', tenants: summaries, generatedAt: new Date().toISOString() });
  } catch (error) {
    res.status(500).json(createErrorPayload('Unable to load tenant summaries', { details: error.message }));
  }
});

app.get('/platform/metrics', async (_req, res) => {
  try {
    const db = await getDatabase();
    const metrics = await calculatePlatformMetrics(db);
    res.json(metrics);
  } catch (error) {
    res.status(500).json(createErrorPayload('Unable to load platform metrics', { details: error.message }));
  }
});

app.get('/companies/:companyId/users', async (req, res) => {
  const { companyId } = req.params;
  try {
    const db = await getDatabase();
    const rows = await db.all('SELECT * FROM users WHERE company_id = ? ORDER BY name COLLATE NOCASE', companyId);
    res.json(rows.map(mapUserRow));
  } catch (error) {
    res.status(500).json(createErrorPayload('Unable to fetch users', { details: error.message }));
  }
});

app.get('/companies/:companyId/clients', async (req, res) => {
  const { companyId } = req.params;
  try {
    const db = await getDatabase();
    const rows = await db.all('SELECT * FROM clients WHERE company_id = ? ORDER BY name COLLATE NOCASE', companyId);
    res.json(rows.map(mapClientRow));
  } catch (error) {
    res.status(500).json(createErrorPayload('Unable to fetch clients', { details: error.message }));
  }
});

app.post('/companies/:companyId/clients', async (req, res) => {
  const { companyId } = req.params;
  const parseResult = clientSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res
      .status(400)
      .json(createErrorPayload('Invalid client payload', { issues: parseResult.error.flatten() }));
  }

  const payload = parseResult.data;
  const id = uuid();
  const now = new Date().toISOString();

  try {
    const db = await getDatabase();
    await db.run(
      `INSERT INTO clients (
        id, company_id, name, email, phone, contact_person, contact_email, contact_phone, billing_address, payment_terms, is_active, street, city, state, zip_code, country, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      id,
      companyId,
      payload.name,
      payload.email ?? payload.contactEmail ?? '',
      payload.phone ?? payload.contactPhone ?? '',
      payload.contactPerson ?? '',
      payload.contactEmail ?? payload.email ?? '',
      payload.contactPhone ?? payload.phone ?? '',
      payload.billingAddress ?? '',
      payload.paymentTerms ?? 'Net 30',
      payload.isActive === false ? 0 : 1,
      payload.address?.street ?? '',
      payload.address?.city ?? '',
      payload.address?.state ?? '',
      payload.address?.zipCode ?? '',
      payload.address?.country ?? '',
      now,
      now,
    );

    const created = await db.get('SELECT * FROM clients WHERE id = ?', id);
    res.status(201).json(mapClientRow(created));
  } catch (error) {
    res.status(500).json(createErrorPayload('Unable to create client', { details: error.message }));
  }
});

app.put('/clients/:clientId', async (req, res) => {
  const { clientId } = req.params;
  const parseResult = clientSchema.partial().safeParse(req.body);
  if (!parseResult.success) {
    return res
      .status(400)
      .json(createErrorPayload('Invalid client payload', { issues: parseResult.error.flatten() }));
  }

  const payload = parseResult.data;

  if (Object.keys(payload).length === 0) {
    return res.status(400).json(createErrorPayload('No update fields provided'));
  }

  try {
    const db = await getDatabase();
    const existing = await db.get('SELECT * FROM clients WHERE id = ?', clientId);
    if (!existing) {
      return res.status(404).json(createErrorPayload('Client not found'));
    }

    await db.run(
      `UPDATE clients SET
        name = COALESCE(?, name),
        email = COALESCE(?, email),
        phone = COALESCE(?, phone),
        contact_person = COALESCE(?, contact_person),
        contact_email = COALESCE(?, contact_email),
        contact_phone = COALESCE(?, contact_phone),
        billing_address = COALESCE(?, billing_address),
        payment_terms = COALESCE(?, payment_terms),
        is_active = COALESCE(?, is_active),
        street = COALESCE(?, street),
        city = COALESCE(?, city),
        state = COALESCE(?, state),
        zip_code = COALESCE(?, zip_code),
        country = COALESCE(?, country),
        updated_at = ?
      WHERE id = ?`,
      payload.name,
      payload.email ?? payload.contactEmail,
      payload.phone ?? payload.contactPhone,
      payload.contactPerson,
      payload.contactEmail ?? payload.email,
      payload.contactPhone ?? payload.phone,
      payload.billingAddress,
      payload.paymentTerms,
      typeof payload.isActive === 'boolean' ? (payload.isActive ? 1 : 0) : undefined,
      payload.address?.street,
      payload.address?.city,
      payload.address?.state,
      payload.address?.zipCode,
      payload.address?.country,
      new Date().toISOString(),
      clientId,
    );

    const updated = await db.get('SELECT * FROM clients WHERE id = ?', clientId);
    res.json(mapClientRow(updated));
  } catch (error) {
    res.status(500).json(createErrorPayload('Unable to update client', { details: error.message }));
  }
});

app.get('/companies/:companyId/client-insights', async (req, res) => {
  const { companyId } = req.params;
  try {
    const db = await getDatabase();

    const counts = await db.get(
      `SELECT COUNT(*) as totalClients,
              SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as activeClients
       FROM clients
       WHERE company_id = ?`,
      companyId,
    );

    const newThisQuarter = await db.get(
      `SELECT COUNT(*) as count
       FROM clients
       WHERE company_id = ?
         AND created_at IS NOT NULL
         AND datetime(created_at) >= datetime(?)`,
      companyId,
      getQuarterStartIso(),
    );

    const atRiskClients = await db.all(
      `SELECT c.id as clientId, c.name as clientName,
              SUM(i.balance) as outstanding,
              COUNT(i.id) as unpaidInvoices,
              MAX(i.due_date) as lastInvoiceDueAt
       FROM invoices i
       JOIN clients c ON c.id = i.client_id
       WHERE i.company_id = ?
         AND i.balance > 0
         AND i.due_date IS NOT NULL
         AND datetime(i.due_date) < datetime('now')
       GROUP BY c.id, c.name
       ORDER BY outstanding DESC
       LIMIT 5`,
      companyId,
    );

    const paymentRecencyRows = await db.all(
      `SELECT i.client_id as clientId, MAX(p.created_at) as lastPaymentAt
       FROM invoice_payments p
       JOIN invoices i ON i.id = p.invoice_id
       WHERE i.company_id = ?
       GROUP BY i.client_id`,
      companyId,
    );

    const lastPaymentMap = new Map(paymentRecencyRows.map((row) => [row.clientId, row.lastPaymentAt ?? undefined]));

    const topRevenueClients = await db.all(
      `SELECT c.id as clientId, c.name as clientName,
              SUM(i.amount_paid) as totalPaid
       FROM invoices i
       JOIN clients c ON c.id = i.client_id
       WHERE i.company_id = ?
         AND i.amount_paid > 0
         AND i.issue_date IS NOT NULL
         AND datetime(i.issue_date) >= datetime(?)
       GROUP BY c.id, c.name
       ORDER BY totalPaid DESC
       LIMIT 5`,
      companyId,
      getYearStartIso(),
    );

    const totalClients = Number(counts?.totalClients ?? 0);
    const activeClients = Number(counts?.activeClients ?? 0);
    const dormantClients = Math.max(0, totalClients - activeClients);

    res.json({
      updatedAt: new Date().toISOString(),
      totalClients,
      activeClients,
      dormantClients,
      newThisQuarter: Number(newThisQuarter?.count ?? 0),
      atRiskClients: atRiskClients.map((row) => ({
        clientId: row.clientId,
        clientName: row.clientName,
        outstanding: Number(row.outstanding ?? 0),
        unpaidInvoices: Number(row.unpaidInvoices ?? 0),
        lastInvoiceDueAt: row.lastInvoiceDueAt ?? undefined,
        lastPaymentAt: lastPaymentMap.get(row.clientId) ?? undefined,
      })),
      topRevenueClients: topRevenueClients.map((row) => ({
        clientId: row.clientId,
        clientName: row.clientName,
        totalPaid: Number(row.totalPaid ?? 0),
      })),
    });
  } catch (error) {
    res.status(500).json(createErrorPayload('Unable to calculate client insights', { details: error.message }));
  }
});

app.get('/companies/:companyId/projects', async (req, res) => {
  const { companyId } = req.params;
  try {
    const db = await getDatabase();
    const rows = await db.all('SELECT * FROM projects WHERE company_id = ? ORDER BY created_at DESC', companyId);
    res.json(rows.map(mapProjectRow));
  } catch (error) {
    res.status(500).json(createErrorPayload('Unable to fetch projects', { details: error.message }));
  }
});

const generateInvoiceNumber = async (db, companyId) => {
  const rows = await db.all('SELECT invoice_number FROM invoices WHERE company_id = ?', companyId);
  const existingNumbers = rows
    .map((row) => row.invoice_number)
    .filter(Boolean)
    .map((value) => {
      const match = /^(?:INV-)?(\d+)$/.exec(value);
      return match ? Number(match[1]) : Number(value?.replace(/\D/g, '') ?? 0);
    });

  const next = (existingNumbers.length ? Math.max(...existingNumbers) : 0) + 1;
  return `INV-${String(next).padStart(3, '0')}`;
};

const persistInvoice = async ({
  db,
  invoiceId,
  companyId,
  clientId,
  projectId,
  status,
  issuedAt,
  dueAt,
  notes,
  taxRate,
  retentionRate,
  lineItems,
  invoiceNumber,
}) => {
  const subtotal = lineItems.reduce((total, item) => total + item.quantity * item.unitPrice, 0);
  const taxAmount = subtotal * taxRate;
  const retentionAmount = subtotal * retentionRate;
  const total = subtotal + taxAmount - retentionAmount;
  const initialAmountPaid = status === 'PAID' ? total : 0;
  const balance = Math.max(0, total - initialAmountPaid);

  const now = new Date().toISOString();

  await db.run(
    `INSERT INTO invoices (
      id, company_id, client_id, project_id, invoice_number, issue_date, due_date, status, subtotal, tax_rate, tax_amount, retention_rate, retention_amount, total, amount_paid, balance, notes, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)` ,
    invoiceId,
    companyId,
    clientId,
    projectId,
    invoiceNumber,
    issuedAt,
    dueAt,
    status,
    subtotal,
    taxRate,
    taxAmount,
    retentionRate,
    retentionAmount,
    total,
    initialAmountPaid,
    balance,
    notes ?? '',
    now,
    now,
  );

  for (const item of lineItems) {
    const lineId = uuid();
    await db.run(
      `INSERT INTO invoice_line_items (id, invoice_id, description, quantity, unit_price, amount) VALUES (?, ?, ?, ?, ?, ?)` ,
      lineId,
      invoiceId,
      item.description,
      item.quantity,
      item.unitPrice,
      item.quantity * item.unitPrice,
    );
  }
};

app.get('/companies/:companyId/invoices', async (req, res) => {
  const { companyId } = req.params;
  try {
    const db = await getDatabase();
    const rows = await db.all(
      'SELECT * FROM invoices WHERE company_id = ? ORDER BY datetime(issue_date) DESC, invoice_number DESC',
      companyId,
    );
    const invoices = [];
    for (const row of rows) {
      invoices.push(await mapInvoiceRow(db, row));
    }
    res.json(invoices);
  } catch (error) {
    res.status(500).json(createErrorPayload('Unable to fetch invoices', { details: error.message }));
  }
});

app.get('/companies/:companyId/invoice-insights', async (req, res) => {
  const { companyId } = req.params;
  try {
    const db = await getDatabase();

    const statusRows = await db.all(
      `SELECT status, COUNT(*) as count, SUM(total) as total, SUM(balance) as outstanding
       FROM invoices
       WHERE company_id = ?
       GROUP BY status`,
      companyId,
    );

    const upcomingDue = await db.get(
      `SELECT COUNT(*) as count, SUM(balance) as total,
              AVG(julianday(due_date) - julianday('now')) as averageDays
       FROM invoices
       WHERE company_id = ?
         AND balance > 0
         AND due_date IS NOT NULL
         AND date(due_date) >= date('now')`,
      companyId,
    );

    const overdue = await db.get(
      `SELECT COUNT(*) as count, SUM(balance) as total,
              AVG(julianday('now') - julianday(due_date)) as averageDays
       FROM invoices
       WHERE company_id = ?
         AND balance > 0
         AND due_date IS NOT NULL
         AND date(due_date) < date('now')`,
      companyId,
    );

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const paidLast30Days = await db.get(
      `SELECT COUNT(DISTINCT invoice_id) as count, SUM(amount) as total
       FROM invoice_payments
       WHERE invoice_id IN (SELECT id FROM invoices WHERE company_id = ?)
         AND datetime(created_at) >= datetime(?)`,
      companyId,
      thirtyDaysAgo,
    );

    const expectedThisMonth = await db.get(
      `SELECT COUNT(*) as count, SUM(balance) as total
       FROM invoices
       WHERE company_id = ?
         AND balance > 0
         AND due_date IS NOT NULL
         AND strftime('%Y-%m', due_date) = strftime('%Y-%m', 'now')`,
      companyId,
    );

    const totalsRow = await db.get(
      `SELECT SUM(total) as totalBilled,
              SUM(amount_paid) as totalCollected,
              SUM(CASE WHEN status != 'CANCELLED' AND balance > 0 THEN balance ELSE 0 END) as outstandingBalance,
              SUM(
                CASE
                  WHEN status != 'CANCELLED'
                    AND balance > 0
                    AND due_date IS NOT NULL
                    AND datetime(due_date) < datetime('now')
                  THEN balance
                  ELSE 0
                END
              ) as overdueBalance,
              SUM(CASE WHEN status = 'DRAFT' THEN 1 ELSE 0 END) as draftCount
       FROM invoices
       WHERE company_id = ?`,
      companyId,
    );

    const topOutstanding = await db.all(
      `SELECT c.id as clientId, c.name as clientName,
              COUNT(i.id) as invoices,
              SUM(i.balance) as outstanding,
              MAX(i.due_date) as lastInvoiceDueAt
       FROM invoices i
       JOIN clients c ON c.id = i.client_id
       WHERE i.company_id = ?
         AND i.balance > 0
       GROUP BY c.id, c.name
       ORDER BY outstanding DESC
       LIMIT 5`,
      companyId,
    );

    const totals = {
      totalBilled: Number(totalsRow?.totalBilled ?? 0),
      totalCollected: Number(totalsRow?.totalCollected ?? 0),
      outstandingBalance: Number(totalsRow?.outstandingBalance ?? 0),
      overdueBalance: Number(totalsRow?.overdueBalance ?? 0),
      draftCount: Number(totalsRow?.draftCount ?? 0),
      collectionRate:
        Number(totalsRow?.totalBilled ?? 0) > 0
          ? Math.round(((Number(totalsRow?.totalCollected ?? 0) / Number(totalsRow?.totalBilled ?? 0)) || 0) * 100)
          : 0,
    };

    const cashFlow = {
      upcomingDue: {
        count: Number(upcomingDue?.count ?? 0),
        total: Number(upcomingDue?.total ?? 0),
        averageDays: Number.isFinite(upcomingDue?.averageDays)
          ? Math.round(Number(upcomingDue?.averageDays ?? 0))
          : undefined,
      },
      overdue: {
        count: Number(overdue?.count ?? 0),
        total: Number(overdue?.total ?? 0),
        averageDays: Number.isFinite(overdue?.averageDays)
          ? Math.round(Number(overdue?.averageDays ?? 0))
          : undefined,
      },
      paidLast30Days: {
        count: Number(paidLast30Days?.count ?? 0),
        total: Number(paidLast30Days?.total ?? 0),
      },
      expectedThisMonth: {
        count: Number(expectedThisMonth?.count ?? 0),
        total: Number(expectedThisMonth?.total ?? 0),
      },
    };

    const statusSummaryMap = new Map(statusRows.map((row) => [row.status, row]));
    const statusSummary = invoiceStatuses.map((status) => {
      const row = statusSummaryMap.get(status) ?? {};
      return {
        status,
        invoiceCount: Number(row.count ?? 0),
        totalBilled: Number(row.total ?? 0),
        outstandingBalance: Number(row.outstanding ?? 0),
      };
    });

    res.json({
      updatedAt: new Date().toISOString(),
      statusSummary,
      cashFlow,
      topOutstandingClients: topOutstanding.map((row) => ({
        clientId: row.clientId,
        clientName: row.clientName,
        outstanding: Number(row.outstanding ?? 0),
        invoices: Number(row.invoices ?? 0),
        lastInvoiceDueAt: row.lastInvoiceDueAt ?? undefined,
      })),
      totals,
    });
  } catch (error) {
    res.status(500).json(createErrorPayload('Unable to calculate invoice insights', { details: error.message }));
  }
});

app.post('/companies/:companyId/invoices', async (req, res) => {
  const { companyId } = req.params;
  const parseResult = invoiceSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res
      .status(400)
      .json(createErrorPayload('Invalid invoice payload', { issues: parseResult.error.flatten() }));
  }

  const payload = parseResult.data;

  if (!ensureInvoiceDatesValid(payload.issuedAt, payload.dueAt)) {
    return res.status(400).json(createErrorPayload('Due date cannot be before issue date'));
  }

  try {
    const db = await getDatabase();
    const client = await db.get('SELECT id FROM clients WHERE id = ? AND company_id = ?', payload.clientId, companyId);
    if (!client) {
      return res.status(404).json(createErrorPayload('Client not found for this company'));
    }

    const project = await db.get('SELECT id FROM projects WHERE id = ? AND company_id = ?', payload.projectId, companyId);
    if (!project) {
      return res.status(400).json(createErrorPayload('Project not found for this company', { field: 'projectId' }));
    }

    const invoiceId = uuid();
    const invoiceNumber = await generateInvoiceNumber(db, companyId);

    await persistInvoice({
      db,
      invoiceId,
      companyId,
      clientId: payload.clientId,
      projectId: payload.projectId,
      status: payload.status,
      issuedAt: payload.issuedAt,
      dueAt: payload.dueAt,
      notes: payload.notes,
      taxRate: payload.taxRate,
      retentionRate: payload.retentionRate,
      lineItems: payload.lineItems,
      invoiceNumber,
    });

    const created = await db.get('SELECT * FROM invoices WHERE id = ?', invoiceId);
    const invoice = await mapInvoiceRow(db, created);
    res.status(201).json(invoice);
  } catch (error) {
    res.status(500).json(createErrorPayload('Unable to create invoice', { details: error.message }));
  }
});

app.put('/invoices/:invoiceId', async (req, res) => {
  const { invoiceId } = req.params;
  const parseResult = invoiceUpdateSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res
      .status(400)
      .json(createErrorPayload('Invalid invoice payload', { issues: parseResult.error.flatten() }));
  }

  const payload = parseResult.data;

  if (Object.keys(payload).length === 0) {
    return res.status(400).json(createErrorPayload('No update fields provided'));
  }

  try {
    const db = await getDatabase();
    const existing = await db.get('SELECT * FROM invoices WHERE id = ?', invoiceId);
    if (!existing) {
      return res.status(404).json(createErrorPayload('Invoice not found'));
    }

    if (payload.clientId) {
      const client = await db.get(
        'SELECT id FROM clients WHERE id = ? AND company_id = ?',
        payload.clientId,
        existing.company_id,
      );
      if (!client) {
        return res.status(404).json(createErrorPayload('Client not found for this company'));
      }
    }

    if (payload.projectId) {
      const project = await db.get(
        'SELECT id FROM projects WHERE id = ? AND company_id = ?',
        payload.projectId,
        existing.company_id,
      );
      if (!project) {
        return res.status(400).json(createErrorPayload('Project not found for this company', { field: 'projectId' }));
      }
    }

    const nextStatus = payload.status ?? existing.status;
    const nextIssuedAt = payload.issuedAt ?? existing.issue_date;
    const nextDueAt = payload.dueAt ?? existing.due_date;
    if (!ensureInvoiceDatesValid(nextIssuedAt, nextDueAt)) {
      return res.status(400).json(createErrorPayload('Due date cannot be before issue date'));
    }

    const nextNotes = payload.notes ?? existing.notes;
    const nextTaxRate = payload.taxRate ?? Number(existing.tax_rate ?? 0);
    const nextRetentionRate = payload.retentionRate ?? Number(existing.retention_rate ?? 0);
    const nextLineItems = payload.lineItems?.length
      ? payload.lineItems
      : await db.all(
          'SELECT description, quantity, unit_price as unitPrice FROM invoice_line_items WHERE invoice_id = ?',
          invoiceId,
        );

    const subtotal = nextLineItems.reduce((total, item) => total + item.quantity * item.unitPrice, 0);
    const taxAmount = subtotal * nextTaxRate;
    const retentionAmount = subtotal * nextRetentionRate;
    const total = subtotal + taxAmount - retentionAmount;
    const amountPaid = Number(existing.amount_paid ?? 0);
    const balance = Math.max(0, total - amountPaid);

    await db.run(
      `UPDATE invoices SET
        client_id = COALESCE(?, client_id),
        project_id = COALESCE(?, project_id),
        invoice_number = COALESCE(?, invoice_number),
        issue_date = ?,
        due_date = ?,
        status = ?,
        subtotal = ?,
        tax_rate = ?,
        tax_amount = ?,
        retention_rate = ?,
        retention_amount = ?,
        total = ?,
        balance = ?,
        notes = ?,
        updated_at = ?
      WHERE id = ?`,
      payload.clientId,
      payload.projectId,
      payload.invoiceNumber,
      nextIssuedAt,
      nextDueAt,
      nextStatus,
      subtotal,
      nextTaxRate,
      taxAmount,
      nextRetentionRate,
      retentionAmount,
      total,
      balance,
      nextNotes,
      new Date().toISOString(),
      invoiceId,
    );

    if (payload.lineItems) {
      await db.run('DELETE FROM invoice_line_items WHERE invoice_id = ?', invoiceId);
      for (const item of nextLineItems) {
        await db.run(
          `INSERT INTO invoice_line_items (id, invoice_id, description, quantity, unit_price, amount) VALUES (?, ?, ?, ?, ?, ?)` ,
          uuid(),
          invoiceId,
          item.description,
          item.quantity,
          item.unitPrice,
          item.quantity * item.unitPrice,
        );
      }
    }

    const updated = await db.get('SELECT * FROM invoices WHERE id = ?', invoiceId);
    const invoice = await mapInvoiceRow(db, updated);
    res.json(invoice);
  } catch (error) {
    res.status(500).json(createErrorPayload('Unable to update invoice', { details: error.message }));
  }
});

app.post('/invoices/:invoiceId/payments', async (req, res) => {
  const { invoiceId } = req.params;
  const parseResult = paymentSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res
      .status(400)
      .json(createErrorPayload('Invalid payment payload', { issues: parseResult.error.flatten() }));
  }

  const payload = parseResult.data;

  try {
    const db = await getDatabase();
    const invoice = await db.get('SELECT * FROM invoices WHERE id = ?', invoiceId);
    if (!invoice) {
      return res.status(404).json(createErrorPayload('Invoice not found'));
    }

    const currentAmountPaid = Number(invoice.amount_paid ?? 0);
    const totalAmount = Number(invoice.total ?? 0);
    const outstanding = Math.max(0, totalAmount - currentAmountPaid);
    if (payload.amount - outstanding > 1e-6) {
      return res
        .status(400)
        .json(
          createErrorPayload('Payment amount exceeds outstanding balance', {
            outstanding,
            attempted: payload.amount,
          }),
        );
    }

    const id = uuid();
    const createdAt = new Date().toISOString();
    await db.run(
      `INSERT INTO invoice_payments (id, invoice_id, amount, method, reference, notes, created_by, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)` ,
      id,
      invoiceId,
      payload.amount,
      payload.method,
      payload.reference ?? null,
      payload.notes ?? null,
      'system',
      createdAt,
    );

    const newAmountPaid = currentAmountPaid + payload.amount;
    const newBalance = Math.max(0, totalAmount - newAmountPaid);
    const nextStatus = newBalance <= 0 ? 'PAID' : invoice.status;

    await db.run(
      `UPDATE invoices SET amount_paid = ?, balance = ?, status = ?, updated_at = ? WHERE id = ?`,
      newAmountPaid,
      newBalance,
      nextStatus,
      createdAt,
      invoiceId,
    );

    const updated = await db.get('SELECT * FROM invoices WHERE id = ?', invoiceId);
    const result = await mapInvoiceRow(db, updated);
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json(createErrorPayload('Unable to record payment', { details: error.message }));
  }
});

export const start = async () => {
  await initialiseSchema();
  app.listen(PORT, () => {
    console.log(`Backend API listening on http://localhost:${PORT}`);
  });
};

if (process.env.NODE_ENV !== 'test') {
  start().catch((error) => {
    console.error('Unable to start backend server', error);
    process.exit(1);
  });
}
