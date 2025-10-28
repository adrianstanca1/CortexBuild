/**
 * SQLite Database Setup
 * Real database with tables for users, sessions, etc.
 */

import sqlite3 from 'sqlite3';
import { promisify } from 'util';
import bcrypt from 'bcryptjs';

const db = new sqlite3.Database('./cortexbuild.db');

// Promisify database methods
const dbRun = promisify(db.run.bind(db));
const dbGet = promisify(db.get.bind(db));
const dbAll = promisify(db.all.bind(db));

/**
 * Initialize database tables
 */
export const initDatabase = async () => {
    console.log('📊 Initializing database...');

    // Users table
    await dbRun(`
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
    await dbRun(`
        CREATE TABLE IF NOT EXISTS companies (
            id TEXT PRIMARY KEY,
            name TEXT UNIQUE NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Sessions table
    await dbRun(`
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
    await dbRun('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)');
    await dbRun('CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token)');
    await dbRun('CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id)');

    console.log('✅ Database initialized');

    // Seed initial data
    await seedInitialData();
};

/**
 * Seed initial data
 */
const seedInitialData = async () => {
    // Check if company exists
    const company = await dbGet('SELECT id FROM companies WHERE id = ?', ['company-1']);
    
    if (!company) {
        console.log('🌱 Seeding initial data...');
        
        // Create company
        await dbRun(
            'INSERT INTO companies (id, name) VALUES (?, ?)',
            ['company-1', 'ConstructCo']
        );

        // Create users
        const users = [
            {
                id: 'user-1',
                email: 'adrian.stanca1@gmail.com',
                password: 'Cumparavinde1',
                name: 'Adrian Stanca',
                role: 'super_admin',
                companyId: 'company-1'
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
            }
        ];

        for (const user of users) {
            const passwordHash = await bcrypt.hash(user.password, 10);
            await dbRun(
                'INSERT INTO users (id, email, password_hash, name, role, company_id) VALUES (?, ?, ?, ?, ?, ?)',
                [user.id, user.email, passwordHash, user.name, user.role, user.companyId]
            );
        }

        console.log('✅ Initial data seeded');
    }
};

/**
 * User operations
 */
export const findUserByEmail = async (email: string) => {
    return dbGet('SELECT * FROM users WHERE email = ?', [email]);
};

export const findUserById = async (id: string) => {
    return dbGet('SELECT * FROM users WHERE id = ?', [id]);
};

export const createUser = async (user: {
    id: string;
    email: string;
    passwordHash: string;
    name: string;
    role: string;
    companyId: string;
}) => {
    await dbRun(
        'INSERT INTO users (id, email, password_hash, name, role, company_id) VALUES (?, ?, ?, ?, ?, ?)',
        [user.id, user.email, user.passwordHash, user.name, user.role, user.companyId]
    );
    return findUserById(user.id);
};

/**
 * Session operations
 */
export const createSession = async (session: {
    id: string;
    userId: string;
    token: string;
    expiresAt: Date;
}) => {
    await dbRun(
        'INSERT INTO sessions (id, user_id, token, expires_at) VALUES (?, ?, ?, ?)',
        [session.id, session.userId, session.token, session.expiresAt.toISOString()]
    );
};

export const findSessionByToken = async (token: string) => {
    return dbGet('SELECT * FROM sessions WHERE token = ?', [token]);
};

export const deleteSession = async (token: string) => {
    await dbRun('DELETE FROM sessions WHERE token = ?', [token]);
};

export const deleteExpiredSessions = async () => {
    await dbRun('DELETE FROM sessions WHERE expires_at < datetime("now")');
};

/**
 * Company operations
 */
export const findCompanyByName = async (name: string) => {
    return dbGet('SELECT * FROM companies WHERE name = ?', [name]);
};

export const createCompany = async (company: { id: string; name: string }) => {
    await dbRun('INSERT INTO companies (id, name) VALUES (?, ?)', [company.id, company.name]);
    return findCompanyByName(company.name);
};

export { db };

