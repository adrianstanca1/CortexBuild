"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Database = void 0;
exports.getDatabase = getDatabase;
exports.closeDatabase = closeDatabase;
const sqlite3_1 = __importDefault(require("sqlite3"));
const path_1 = __importDefault(require("path"));
const sqlite = sqlite3_1.default.verbose();
class Database {
    db;
    isConnected = false;
    constructor(dbPath) {
        const databasePath = dbPath || path_1.default.join(process.cwd(), 'database.sqlite');
        this.db = new sqlite.Database(databasePath, (err) => {
            if (err) {
                console.error('Error opening database:', err.message);
            }
            else {
                console.log('Connected to SQLite database:', databasePath);
                this.isConnected = true;
                this.db.run('PRAGMA foreign_keys = ON');
            }
        });
    }
    run(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.run(sql, params, function (err) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(this);
                }
            });
        });
    }
    get(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.get(sql, params, (err, row) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(row);
                }
            });
        });
    }
    all(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.all(sql, params, (err, rows) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(rows);
                }
            });
        });
    }
    async transaction(callback) {
        await this.run('BEGIN TRANSACTION');
        try {
            const result = await callback(this);
            await this.run('COMMIT');
            return result;
        }
        catch (error) {
            await this.run('ROLLBACK');
            throw error;
        }
    }
    async healthCheck() {
        const startTime = Date.now();
        try {
            await this.get('SELECT 1 as test');
            const responseTime = Date.now() - startTime;
            return { status: 'connected', responseTime };
        }
        catch (error) {
            console.error('Database health check failed:', error);
            return { status: 'disconnected' };
        }
    }
    async getStats() {
        try {
            const tables = await this.all(`
        SELECT COUNT(*) as count 
        FROM sqlite_master 
        WHERE type='table' AND name NOT LIKE 'sqlite_%'
      `);
            const tableNames = await this.all(`
        SELECT name 
        FROM sqlite_master 
        WHERE type='table' AND name NOT LIKE 'sqlite_%'
      `);
            let totalRows = 0;
            for (const table of tableNames) {
                const result = await this.get(`SELECT COUNT(*) as count FROM ${table.name}`);
                totalRows += result.count;
            }
            const pageCount = await this.get('PRAGMA page_count');
            const pageSize = await this.get('PRAGMA page_size');
            const databaseSize = (pageCount.page_count || 0) * (pageSize.page_size || 0);
            return {
                tables: tables[0].count,
                totalRows,
                databaseSize
            };
        }
        catch (error) {
            console.error('Error getting database stats:', error);
            return { tables: 0, totalRows: 0, databaseSize: 0 };
        }
    }
    close() {
        return new Promise((resolve, reject) => {
            this.db.close((err) => {
                if (err) {
                    reject(err);
                }
                else {
                    this.isConnected = false;
                    console.log('Database connection closed');
                    resolve();
                }
            });
        });
    }
    get connected() {
        return this.isConnected;
    }
    get instance() {
        return this.db;
    }
}
exports.Database = Database;
let dbInstance = null;
function getDatabase() {
    if (!dbInstance) {
        dbInstance = new Database();
    }
    return dbInstance;
}
async function closeDatabase() {
    if (dbInstance) {
        await dbInstance.close();
        dbInstance = null;
    }
}
exports.default = Database;
//# sourceMappingURL=connection.js.map