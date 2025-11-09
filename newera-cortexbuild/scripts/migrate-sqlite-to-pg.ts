import path from 'node:path';
import Database from 'better-sqlite3';
import { Client } from 'pg';

type TableMapping = {
  sqliteTable: string;
  pgTable: string;
  columns: string[];
};

const mappings: TableMapping[] = [
  {
    sqliteTable: 'tenants',
    pgTable: 'Tenant',
    columns: ['id', 'name', 'slug', 'plan', 'created_at', 'updated_at']
  },
  {
    sqliteTable: 'users',
    pgTable: 'User',
    columns: [
      'id',
      'tenant_id',
      'email',
      'full_name',
      'password_hash',
      'role',
      'status',
      'created_at',
      'updated_at'
    ]
  },
  {
    sqliteTable: 'projects',
    pgTable: 'Project',
    columns: [
      'id',
      'tenant_id',
      'name',
      'code',
      'status',
      'start_date',
      'end_date',
      'budget',
      'created_at',
      'updated_at'
    ]
  }
];

const SQLITE_PATH = process.env.SQLITE_PATH ?? path.resolve('../cortexbuild.db');
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('Missing DATABASE_URL env var');
  process.exit(1);
}

async function migrate() {
  const sqlite = new Database(SQLITE_PATH, { readonly: true });
  const pg = new Client({ connectionString: DATABASE_URL });
  await pg.connect();

  try {
    await pg.query('BEGIN');

    for (const mapping of mappings) {
      const rows = sqlite
        .prepare(
          `SELECT ${mapping.columns
            .map((column) => `\`${column}\``)
            .join(', ')} FROM ${mapping.sqliteTable}`
        )
        .all();

      console.log(`Migrating ${rows.length} rows from ${mapping.sqliteTable} → ${mapping.pgTable}`);

      for (const row of rows) {
        const values = mapping.columns.map((column) => row[column]);
        const placeholders = values.map((_, index) => `$${index + 1}`).join(', ');

        await pg.query(
          `INSERT INTO "${mapping.pgTable}" (${mapping.columns
            .map((column) => `"${column}"`)
            .join(', ')})
           VALUES (${placeholders})
           ON CONFLICT ("id") DO UPDATE SET ${mapping.columns
             .map((column) => `"${column}" = EXCLUDED."${column}"`)
             .join(', ')}`,
          values
        );
      }
    }

    await pg.query('COMMIT');
    console.log('Migration complete ✅');
  } catch (error) {
    await pg.query('ROLLBACK');
    console.error('Migration failed ❌', error);
    process.exitCode = 1;
  } finally {
    await pg.end();
    sqlite.close();
  }
}

migrate();
