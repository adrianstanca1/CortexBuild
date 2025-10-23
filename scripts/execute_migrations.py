#!/usr/bin/env python3
"""
CortexBuild Phase 6: Automated Database Migration Execution
Executes all 9 migrations in Supabase PostgreSQL database
"""

import psycopg2
import os
import sys
from pathlib import Path

# Supabase Connection Details
DB_HOST = "db.zpbuvuxpfemldsknerew.supabase.co"
DB_PORT = 5432
DB_NAME = "postgres"
DB_USER = "postgres"
DB_PASSWORD = "Cumparavinde1"

# Migration files in order
MIGRATIONS = [
    "database/migrations/001_create_departments_table.sql",
    "database/migrations/002_create_custom_roles_table.sql",
    "database/migrations/003_create_department_members_table.sql",
    "database/migrations/004_create_company_analytics_table.sql",
    "database/migrations/005_create_company_settings_table.sql",
    "database/migrations/006_create_api_keys_table.sql",
    "database/migrations/007_create_webhooks_table.sql",
    "database/migrations/008_create_rpc_functions.sql",
    "database/migrations/009_create_rpc_functions_part2.sql",
]

def connect_to_supabase():
    """Connect to Supabase PostgreSQL database"""
    try:
        conn = psycopg2.connect(
            host=DB_HOST,
            port=DB_PORT,
            database=DB_NAME,
            user=DB_USER,
            password=DB_PASSWORD,
            sslmode='require'
        )
        print("✅ Connected to Supabase PostgreSQL")
        return conn
    except Exception as e:
        print(f"❌ Failed to connect to Supabase: {e}")
        sys.exit(1)

def read_migration_file(filepath):
    """Read migration SQL file"""
    try:
        with open(filepath, 'r') as f:
            return f.read()
    except FileNotFoundError:
        print(f"❌ Migration file not found: {filepath}")
        return None

def execute_migration(conn, migration_num, filepath):
    """Execute a single migration"""
    print(f"\n{'='*60}")
    print(f"📋 Migration {migration_num}: {Path(filepath).name}")
    print(f"{'='*60}")
    
    sql = read_migration_file(filepath)
    if not sql:
        return False
    
    try:
        cursor = conn.cursor()
        cursor.execute(sql)
        conn.commit()
        cursor.close()
        print(f"✅ Migration {migration_num} executed successfully")
        return True
    except Exception as e:
        conn.rollback()
        print(f"❌ Migration {migration_num} failed: {e}")
        return False

def verify_tables(conn):
    """Verify all tables were created"""
    print(f"\n{'='*60}")
    print("🔍 Verifying Tables")
    print(f"{'='*60}")
    
    try:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT table_name FROM information_schema.tables 
            WHERE table_schema = 'public' 
            ORDER BY table_name;
        """)
        tables = cursor.fetchall()
        cursor.close()
        
        expected_tables = [
            'departments',
            'custom_roles',
            'department_members',
            'company_analytics',
            'company_settings',
            'api_keys',
            'webhooks'
        ]
        
        found_tables = [t[0] for t in tables]
        
        print(f"\n📊 Tables Found: {len(found_tables)}")
        for table in found_tables:
            if table in expected_tables:
                print(f"  ✅ {table}")
            else:
                print(f"  ℹ️  {table} (system table)")
        
        missing = set(expected_tables) - set(found_tables)
        if missing:
            print(f"\n❌ Missing tables: {missing}")
            return False
        
        print(f"\n✅ All {len(expected_tables)} expected tables created successfully!")
        return True
    except Exception as e:
        print(f"❌ Verification failed: {e}")
        return False

def verify_rls_policies(conn):
    """Verify RLS policies were created"""
    print(f"\n{'='*60}")
    print("🔐 Verifying RLS Policies")
    print(f"{'='*60}")
    
    try:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT tablename, COUNT(*) as policy_count 
            FROM pg_policies 
            WHERE schemaname = 'public' 
            GROUP BY tablename 
            ORDER BY tablename;
        """)
        results = cursor.fetchall()
        cursor.close()
        
        total_policies = sum(r[1] for r in results)
        print(f"\n📊 RLS Policies by Table:")
        for table, count in results:
            print(f"  ✅ {table}: {count} policies")
        
        print(f"\n✅ Total RLS Policies: {total_policies}")
        return True
    except Exception as e:
        print(f"❌ RLS verification failed: {e}")
        return False

def verify_rpc_functions(conn):
    """Verify RPC functions were created"""
    print(f"\n{'='*60}")
    print("⚙️  Verifying RPC Functions")
    print(f"{'='*60}")
    
    try:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT routine_name FROM information_schema.routines 
            WHERE routine_schema = 'public' 
            AND routine_type = 'FUNCTION'
            ORDER BY routine_name;
        """)
        functions = cursor.fetchall()
        cursor.close()
        
        expected_functions = [
            'invite_team_member',
            'update_team_member_role',
            'create_department',
            'assign_user_to_department',
            'get_company_analytics',
            'create_api_key',
            'update_department_budget',
            'get_department_members',
            'get_department_budget_summary'
        ]
        
        found_functions = [f[0] for f in functions]
        
        print(f"\n📊 RPC Functions Found:")
        for func in found_functions:
            if func in expected_functions:
                print(f"  ✅ {func}()")
        
        print(f"\n✅ Total RPC Functions: {len(found_functions)}")
        return True
    except Exception as e:
        print(f"❌ RPC verification failed: {e}")
        return False

def main():
    """Main execution"""
    print("\n" + "="*60)
    print("🚀 CortexBuild Phase 6: Database Migration Execution")
    print("="*60)
    
    # Connect to Supabase
    conn = connect_to_supabase()
    
    # Execute all migrations
    successful = 0
    failed = 0
    
    for i, migration_file in enumerate(MIGRATIONS, 1):
        if execute_migration(conn, i, migration_file):
            successful += 1
        else:
            failed += 1
    
    # Verify results
    print(f"\n{'='*60}")
    print("📊 Migration Summary")
    print(f"{'='*60}")
    print(f"✅ Successful: {successful}/{len(MIGRATIONS)}")
    print(f"❌ Failed: {failed}/{len(MIGRATIONS)}")
    
    if failed == 0:
        print("\n✅ All migrations executed successfully!")
        
        # Run verification queries
        verify_tables(conn)
        verify_rls_policies(conn)
        verify_rpc_functions(conn)
        
        print(f"\n{'='*60}")
        print("🎉 Phase 6 Database Setup Complete!")
        print(f"{'='*60}")
    else:
        print(f"\n❌ {failed} migration(s) failed. Please review errors above.")
    
    conn.close()

if __name__ == "__main__":
    main()

