import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import Database from 'better-sqlite3';

const JWT_SECRET = process.env.JWT_SECRET || 'cortexbuild-secret-2025';
const TOKEN_EXPIRY = '24h';

interface JWTPayload {
  userId: string;
  email: string;
}

interface DbUserRow {
  id: number | string;
  email: string;
  password?: string;
  password_hash?: string;
  first_name?: string;
  last_name?: string;
  name?: string;
  role: string;
  avatar?: string;
  avatar_url?: string;
  company_id?: number | string;
}

let globalDb: Database.Database | null = null;
let userTableInfoCache: { hasPasswordHash: boolean } | null = null;

export const setDatabase = (dbInstance: Database.Database) => {
  globalDb = dbInstance;
  userTableInfoCache = null;
};

const requireDb = (): Database.Database => {
  if (!globalDb) {
    throw new Error('Database not initialized');
  }
  return globalDb;
};

const getUserTableInfo = (db: Database.Database) => {
  if (!userTableInfoCache) {
    const columns = db
      .prepare("PRAGMA table_info('users')")
      .all() as { name: string }[];

    userTableInfoCache = {
      hasPasswordHash: columns.some((column) => column.name === 'password_hash'),
    };
  }

  return userTableInfoCache;
};

const mapUserRow = (row: DbUserRow | undefined | null) => {
  if (!row) {
    return null;
  }

  const firstName = row.first_name ?? '';
  const lastName = row.last_name ?? '';
  const legacyName = row.name ?? '';
  const displayName =
    `${firstName} ${lastName}`.trim() ||
    legacyName.trim() ||
    row.email ||
    'User';

  return {
    id: String(row.id),
    email: row.email,
    name: displayName,
    role: row.role,
    avatar: row.avatar_url ?? row.avatar ?? '',
    company_id:
      row.company_id !== undefined && row.company_id !== null
        ? String(row.company_id)
        : undefined,
  };
};

const ensureSessionsTable = (db: Database.Database) => {
  db.exec(`
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL,
      token TEXT UNIQUE NOT NULL,
      expires_at DATETIME NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  db.exec(
    'CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);',
  );
  db.exec(
    'CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);',
  );
};

const getUserByEmail = (db: Database.Database, email: string) => {
  return db
    .prepare('SELECT * FROM users WHERE LOWER(email) = LOWER(?)')
    .get(email) as DbUserRow | undefined;
};

const getUserById = (db: Database.Database, id: string | number) => {
  return db
    .prepare('SELECT * FROM users WHERE id = ?')
    .get(id) as DbUserRow | undefined;
};

export const login = (
  db: Database.Database,
  email: string,
  password: string,
) => {
  console.log('🔐 [Auth] Login attempt:', email);

  ensureSessionsTable(db);

  const user = getUserByEmail(db, email);

  if (!user) {
    console.error('❌ [Auth] User not found');
    throw new Error('Invalid email or password');
  }

  const hash = user.password_hash ?? user.password;
  const isValidPassword = hash ? bcrypt.compareSync(password, hash) : false;

  if (!isValidPassword) {
    console.error('❌ [Auth] Invalid password');
    throw new Error('Invalid email or password');
  }

  const token = jwt.sign(
    { userId: String(user.id), email: user.email } as JWTPayload,
    JWT_SECRET,
    { expiresIn: TOKEN_EXPIRY },
  );

  const sessionId = uuidv4();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  db.prepare(
    'INSERT INTO sessions (id, user_id, token, expires_at) VALUES (?, ?, ?, ?)',
  ).run(sessionId, user.id, token, expiresAt.toISOString());

  console.log('✅ [Auth] Login successful');

  return {
    token,
    user: mapUserRow(user),
  };
};

export const register = (
  db: Database.Database,
  email: string,
  password: string,
  name: string,
  companyName: string,
) => {
  console.log('📝 [Auth] Registration attempt:', email);

  const existingUser = getUserByEmail(db, email);

  if (existingUser) {
    console.error('❌ [Auth] User already exists');
    throw new Error('User already exists');
  }

  const passwordHash = bcrypt.hashSync(password, 10);

  const companyRecord = db
    .prepare('SELECT id FROM companies WHERE LOWER(name) = LOWER(?)')
    .get(companyName) as { id: number } | undefined;

  let companyId: number;
  if (companyRecord) {
    companyId = companyRecord.id;
  } else {
    const insertCompany = db
      .prepare(
        'INSERT INTO companies (name, created_at, updated_at) VALUES (?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)',
      )
      .run(companyName);
    companyId = Number(insertCompany.lastInsertRowid);
  }

  const trimmedName = name.trim();
  const [firstName, ...rest] = trimmedName.split(' ');
  const lastName = rest.length > 0 ? rest.join(' ') : firstName;

  const { hasPasswordHash } = getUserTableInfo(db);
  const passwordColumn = hasPasswordHash ? 'password_hash' : 'password';

  const insertUser = db
    .prepare(
      `INSERT INTO users (
        email,
        ${passwordColumn},
        first_name,
        last_name,
        role,
        company_id,
        is_active,
        email_verified,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, 1, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
    )
    .run(email, passwordHash, firstName, lastName, 'user', companyId);

  const userId = Number(insertUser.lastInsertRowid);
  ensureSessionsTable(db);

  const token = jwt.sign(
    { userId: String(userId), email } as JWTPayload,
    JWT_SECRET,
    { expiresIn: TOKEN_EXPIRY },
  );

  const sessionId = uuidv4();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  db.prepare(
    'INSERT INTO sessions (id, user_id, token, expires_at) VALUES (?, ?, ?, ?)',
  ).run(sessionId, userId, token, expiresAt.toISOString());

  const user = getUserById(db, userId);

  console.log('✅ [Auth] User registered successfully');

  return {
    token,
    user: mapUserRow(user),
  };
};

export const verifyToken = (token: string): JWTPayload => {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    throw new Error('Invalid token');
  }
};

export const getCurrentUserByToken = (db: Database.Database, token: string) => {
  const payload = verifyToken(token);
  const user = getUserById(db, payload.userId);

  if (!user) {
    throw new Error('User not found');
  }

  return mapUserRow(user);
};

export const logout = (db: Database.Database, token: string) => {
  console.log('👋 [Auth] Logout');
  ensureSessionsTable(db);
  db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
  return { success: true };
};

export const refreshToken = async (token: string) => {
  console.log('🔄 [Auth] Refreshing token');

  const db = requireDb();
  ensureSessionsTable(db);

  const payload = verifyToken(token);
  const user = getUserById(db, payload.userId);

  if (!user) {
    throw new Error('User not found');
  }

  const newToken = jwt.sign(
    { userId: String(user.id), email: user.email } as JWTPayload,
    JWT_SECRET,
    { expiresIn: TOKEN_EXPIRY },
  );

  db.prepare(
    'UPDATE sessions SET token = ?, expires_at = ? WHERE token = ?',
  ).run(
    newToken,
    new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    token,
  );

  console.log('✅ [Auth] Token refreshed');

  return {
    token: newToken,
    user: mapUserRow(user),
  };
};

export const cleanupExpiredSessions = () => {
  console.log('🧹 [Auth] Cleaning up expired sessions');
  const db = requireDb();
  ensureSessionsTable(db);
  db.prepare("DELETE FROM sessions WHERE expires_at < datetime('now')").run();
};

export const getCurrentUser = async (req: any, res: any, next: any) => {
  const authHeader = req.headers?.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res
      .status(401)
      .json({ success: false, error: 'No token provided' });
  }

  try {
    const db = requireDb();
    const payload = verifyToken(token);
    const user = getUserById(db, payload.userId);

    if (!user) {
      return res.status(401).json({ success: false, error: 'User not found' });
    }

    const company = db
      .prepare('SELECT name FROM companies WHERE id = ?')
      .get(user.company_id) as { name?: string } | undefined;

    req.user = {
      userId: String(user.id),
      email: user.email,
      name: mapUserRow(user)?.name ?? user.email,
      role: user.role,
      companyId: user.company_id,
      companyName: company?.name ?? 'Unknown Company',
    };

    next();
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(403).json({ success: false, error: 'Invalid token' });
  }
};

export const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers?.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res
      .status(401)
      .json({ success: false, error: 'No token provided' });
  }

  try {
    const db = requireDb();
    const payload = verifyToken(token);
    const user = getUserById(db, payload.userId);

    if (!user) {
      return res.status(401).json({ success: false, error: 'User not found' });
    }

    req.user = mapUserRow(user);
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(403).json({ success: false, error: 'Invalid token' });
  }
};

export default {
  login,
  register,
  verifyToken,
  getCurrentUser,
  getCurrentUserByToken,
  logout,
  refreshToken,
  authenticateToken,
  cleanupExpiredSessions,
  setDatabase,
};
