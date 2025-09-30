import sqlite3 from 'sqlite3';
export declare class Database {
    private db;
    private isConnected;
    constructor(dbPath?: string);
    run(sql: string, params?: any[]): Promise<sqlite3.RunResult>;
    get<T = any>(sql: string, params?: any[]): Promise<T | undefined>;
    all<T = any>(sql: string, params?: any[]): Promise<T[]>;
    transaction<T>(callback: (db: Database) => Promise<T>): Promise<T>;
    healthCheck(): Promise<{
        status: 'connected' | 'disconnected';
        responseTime?: number;
    }>;
    getStats(): Promise<{
        tables: number;
        totalRows: number;
        databaseSize: number;
    }>;
    close(): Promise<void>;
    get connected(): boolean;
    get instance(): sqlite3.Database;
}
export declare function getDatabase(): Database;
export declare function closeDatabase(): Promise<void>;
export default Database;
//# sourceMappingURL=connection.d.ts.map