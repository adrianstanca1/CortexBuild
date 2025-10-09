/**
 * SQLite Database Setup
 * Real database with tables for users, sessions, etc.
 */

import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';

const db = new Database('./cortexbuild.db');
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

/**
 * Initialize database tables
 */
export const initDatabase = () => {
    console.log('📊 Initializing database...');

    // Users table
    db.exec(`
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            name TEXT NOT NULL,
            role TEXT NOT NULL,
            avatar TEXT,
            company_id TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Companies table
    db.exec(`
        CREATE TABLE IF NOT EXISTS companies (
            id TEXT PRIMARY KEY,
            name TEXT UNIQUE NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Sessions table
    db.exec(`
        CREATE TABLE IF NOT EXISTS sessions (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            token TEXT UNIQUE NOT NULL,
            expires_at DATETIME NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    `);

    // Create indexes
    db.exec('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)');
    db.exec('CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token)');
    db.exec('CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id)');

    console.log('✅ Database initialized');

    // Seed initial data
    seedInitialData();
};

/**
 * Seed initial data
 */
const seedInitialData = () => {
    // Check if company exists
    const company = db.prepare('SELECT id FROM companies WHERE id = ?').get('company-1');

    if (!company) {
        console.log('🌱 Seeding initial data...');

        // Create company
        db.prepare('INSERT INTO companies (id, name) VALUES (?, ?)').run('company-1', 'ConstructCo');
        db.prepare('INSERT INTO companies (id, name) VALUES (?, ?)').run('company-2', 'AS CLADDING AND ROOFING LTD');

        // Create users
        const users = [
            {
                id: 'user-1',
                email: 'adrian.stanca1@gmail.com',
                password: 'password123',
                name: 'Adrian Stanca',
                role: 'super_admin',
                companyId: 'company-1'
            },
            {
                id: 'user-4',
                email: 'adrian@ascladdingltd.co.uk',
                password: 'Lolozania1',
                name: 'Adrian Stanca',
                role: 'company_admin',
                companyId: 'company-2'
            },
            {
                id: 'user-2',
                email: 'casey@constructco.com',
                password: 'password123',
                name: 'Casey Johnson',
                role: 'company_admin',
                companyId: 'company-1'
            },
            {
                id: 'user-3',
                email: 'mike@constructco.com',
                password: 'password123',
                name: 'Mike Wilson',
                role: 'supervisor',
                companyId: 'company-1'
            },
            {
                id: 'user-5',
                email: 'dev@constructco.com',
                password: 'password123',
                name: 'Dev User',
                role: 'developer',
                companyId: 'company-1'
            }
        ];

        for (const user of users) {
            const passwordHash = bcrypt.hashSync(user.password, 10);
            db.prepare('INSERT INTO users (id, email, password_hash, name, role, company_id) VALUES (?, ?, ?, ?, ?, ?)').run(
                user.id, user.email, passwordHash, user.name, user.role, user.companyId
            );
        }

        console.log('✅ Initial data seeded');
    }
};

/**
 * User operations
 */
export const findUserByEmail = (email: string) => {
    return db.prepare('SELECT * FROM users WHERE email = ?').get(email);
};

export const findUserById = (id: string) => {
    return db.prepare('SELECT * FROM users WHERE id = ?').get(id);
};

export const createUser = (user: {
    id: string;
    email: string;
    passwordHash: string;
    name: string;
    role: string;
    companyId: string;
}) => {
    db.prepare('INSERT INTO users (id, email, password_hash, name, role, company_id) VALUES (?, ?, ?, ?, ?, ?)').run(
        user.id, user.email, user.passwordHash, user.name, user.role, user.companyId
    );
    return findUserById(user.id);
};

/**
 * Session operations
 */
export const createSession = (session: {
    id: string;
    userId: string;
    token: string;
    expiresAt: Date;
}) => {
    db.prepare('INSERT INTO sessions (id, user_id, token, expires_at) VALUES (?, ?, ?, ?)').run(
        session.id, session.userId, session.token, session.expiresAt.toISOString()
    );
};

export const findSessionByToken = (token: string) => {
    return db.prepare('SELECT * FROM sessions WHERE token = ?').get(token);
};

export const deleteSession = (token: string) => {
    db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
};

export const deleteExpiredSessions = () => {
    db.prepare('DELETE FROM sessions WHERE expires_at < datetime("now")').run();
};

/**
 * Company operations
 */
export const findCompanyByName = (name: string) => {
    return db.prepare('SELECT * FROM companies WHERE name = ?').get(name);
};

export const createCompany = (company: { id: string; name: string }) => {
    db.prepare('INSERT INTO companies (id, name) VALUES (?, ?)').run(company.id, company.name);
    return findCompanyByName(company.name);
};

export { db };

