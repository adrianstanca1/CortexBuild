import { getDatabaseConfig } from '../config/database';
import { IDatabaseAdapter, DatabaseConfig } from './DatabaseAdapter';
import { SupabaseService } from './SupabaseService';
import { SQLiteService } from './SQLiteService';

let cachedAdapter: IDatabaseAdapter | null = null;
let cachedMode: string | null = null;

export function getDatabaseAdapter(): IDatabaseAdapter {
  const envConfig = getDatabaseConfig();
  const mode = envConfig.mode;

  if (cachedAdapter && cachedMode === mode) {
    return cachedAdapter;
  }

  const config: DatabaseConfig = {
    mode,
    supabase: envConfig.supabase,
    sqlite: envConfig.sqlite,
  };

  cachedMode = mode;
  cachedAdapter = mode === 'sqlite' ? new SQLiteService(config) : new SupabaseService(config);
  return cachedAdapter;
}

export async function ensureDatabaseConnected(): Promise<IDatabaseAdapter> {
  const adapter = getDatabaseAdapter();
  if (!adapter.isConnected()) {
    await adapter.connect();
  }
  return adapter;
}


