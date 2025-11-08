/**
 * Database Provider
 * React Context for managing database connections and switching between providers
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { IDatabaseAdapter, DatabaseMode, DatabaseConfig } from './DatabaseAdapter';
import { SupabaseService } from './SupabaseService';

interface DatabaseContextValue {
  db: IDatabaseAdapter | null;
  mode: DatabaseMode;
  isConnected: boolean;
  switchDatabase: (mode: DatabaseMode) => Promise<void>;
  reconnect: () => Promise<void>;
  exportData: () => Promise<Record<string, any[]>>;
  importData: (data: Record<string, any[]>) => Promise<void>;
}

const DatabaseContext = createContext<DatabaseContextValue | undefined>(undefined);

export const useDatabase = () => {
  const context = useContext(DatabaseContext);
  if (!context) {
    throw new Error('useDatabase must be used within a DatabaseProvider');
  }
  return context;
};

interface DatabaseProviderProps {
  children: ReactNode;
  initialMode?: DatabaseMode;
}

export const DatabaseProvider: React.FC<DatabaseProviderProps> = ({
  children,
  initialMode
}) => {
  // Determine initial mode from environment or prop
  const getInitialMode = (): DatabaseMode => {
    if (initialMode) return initialMode;

    const envMode = import.meta.env.VITE_DATABASE_MODE as DatabaseMode;
    if (envMode === 'sqlite' || envMode === 'supabase') {
      return envMode;
    }

    // Default to Supabase for browser environment
    return 'supabase';
  };

  const [mode, setMode] = useState<DatabaseMode>(getInitialMode());
  const [db, setDb] = useState<IDatabaseAdapter | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // Create database instance based on mode
  const createDatabaseInstance = (dbMode: DatabaseMode): IDatabaseAdapter | null => {
    const config: DatabaseConfig = { mode: dbMode };

    if (dbMode === 'supabase') {
      config.supabase = {
        url: import.meta.env.VITE_SUPABASE_URL || '',
        anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.REACT_APP_SUPABASE_PUBLISHABLE_DEFAULT_KEY || '',
        serviceKey: import.meta.env.SUPABASE_SERVICE_KEY,
      };
      return new SupabaseService(config);
    }

    if (dbMode === 'sqlite') {
      // SQLite is backend-only, cannot be used in browser
      console.warn('SQLite mode is not supported in browser environment');
      return null;
    }

    return null;
  };

  // Connect to database
  const connectToDatabase = async (dbMode: DatabaseMode) => {
    try {
      const dbInstance = createDatabaseInstance(dbMode);

      if (!dbInstance) {
        throw new Error(`Failed to create database instance for mode: ${dbMode}`);
      }

      await dbInstance.connect();

      setDb(dbInstance);
      setMode(dbMode);
      setIsConnected(true);

      console.log(`✅ Connected to ${dbMode} database`);
    } catch (error) {
      console.error(`❌ Failed to connect to ${dbMode} database:`, error);
      setIsConnected(false);
      throw error;
    }
  };

  // Initialize database connection on mount
  useEffect(() => {
    const initializeDatabase = async () => {
      await connectToDatabase(mode);
    };

    initializeDatabase();

    // Cleanup on unmount
    return () => {
      if (db) {
        db.disconnect();
      }
    };
  }, []); // Only run once on mount

  // Switch database provider
  const switchDatabase = async (newMode: DatabaseMode) => {
    try {
      // Disconnect from current database
      if (db) {
        await db.disconnect();
      }

      // Connect to new database
      await connectToDatabase(newMode);

      // Store preference in localStorage
      localStorage.setItem('cortexbuild_db_mode', newMode);

      console.log(`🔄 Switched to ${newMode} database`);
    } catch (error) {
      console.error(`❌ Failed to switch to ${newMode} database:`, error);
      throw error;
    }
  };

  // Reconnect to current database
  const reconnect = async () => {
    if (db) {
      await db.disconnect();
    }
    await connectToDatabase(mode);
  };

  // Export data from current database
  const exportData = async (): Promise<Record<string, any[]>> => {
    if (!db || !db.exportData) {
      throw new Error('Export not supported for current database');
    }
    return db.exportData();
  };

  // Import data to current database
  const importData = async (data: Record<string, any[]>): Promise<void> => {
    if (!db || !db.importData) {
      throw new Error('Import not supported for current database');
    }
    return db.importData(data);
  };

  const value: DatabaseContextValue = {
    db,
    mode,
    isConnected,
    switchDatabase,
    reconnect,
    exportData,
    importData,
  };

  return (
    <DatabaseContext.Provider value={value}>
      {children}
    </DatabaseContext.Provider>
  );
};

// Hook for accessing specific database operations
export const useDatabaseOperations = () => {
  const { db, isConnected } = useDatabase();

  if (!db || !isConnected) {
    throw new Error('Database not connected');
  }

  return {
    // User operations
    findUserByEmail: (email: string) => db.findUserByEmail(email),
    findUserById: (id: string) => db.findUserById(id),
    createUser: (user: any) => db.createUser(user),
    updateUser: (id: string, data: any) => db.updateUser(id, data),

    // Company operations
    findCompanyById: (id: string) => db.findCompanyById(id),
    findCompanyByName: (name: string) => db.findCompanyByName(name),
    createCompany: (company: any) => db.createCompany(company),
    updateCompany: (id: string, data: any) => db.updateCompany(id, data),
    listCompanies: (filters?: any) => db.listCompanies(filters),

    // Project operations
    findProjectById: (id: string | number) => db.findProjectById(id),
    listProjects: (companyId: string, filters?: any) => db.listProjects(companyId, filters),
    createProject: (project: any) => db.createProject(project),
    updateProject: (id: string | number, data: any) => db.updateProject(id, data),
    deleteProject: (id: string | number) => db.deleteProject(id),

    // Generic operations
    select: <T = any>(table: string, filters?: any, options?: any) =>
      db.select<T>(table, filters, options),
    selectOne: <T = any>(table: string, filters: any) =>
      db.selectOne<T>(table, filters),
    insert: <T = any>(table: string, data: any) =>
      db.insert<T>(table, data),
    update: <T = any>(table: string, filters: any, data: any) =>
      db.update<T>(table, filters, data),
    delete: (table: string, filters: any) =>
      db.delete(table, filters),

    // Transaction support (avoid TSX generic parsing)
    transaction: (callback: () => Promise<any>) => db.transaction(callback),

    // Health check
    healthCheck: () => db.healthCheck(),
  };
};


