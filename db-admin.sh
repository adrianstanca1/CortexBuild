#!/bin/bash

# CortexBuild Database Management Script
# Usage: ./db-admin.sh [command]

DB_FILE="cortexbuild.db"

case "$1" in
  "status")
    echo "📊 Database Status"
    echo "=================="
    sqlite3 $DB_FILE << EOF
.mode column
.headers on
SELECT 'Users' as Category, COUNT(*) as Count FROM users
UNION ALL SELECT 'Companies', COUNT(*) FROM companies
UNION ALL SELECT 'Projects', COUNT(*) FROM projects
UNION ALL SELECT 'Clients', COUNT(*) FROM clients
UNION ALL SELECT 'Tasks', COUNT(*) FROM tasks
UNION ALL SELECT 'AI Agents', COUNT(*) FROM ai_agents;
EOF
    ;;

  "users")
    echo "👥 All Users"
    echo "============"
    sqlite3 $DB_FILE << EOF
.mode column
.headers on
SELECT id, email, name, role, company_id FROM users ORDER BY role;
EOF
    ;;

  "projects")
    echo "🏗️  All Projects"
    echo "==============="
    sqlite3 $DB_FILE << EOF
.mode column
.headers on
SELECT id, name, status, company_id FROM projects;
EOF
    ;;

  "tasks")
    echo "✅ Tasks Summary"
    echo "==============="
    sqlite3 $DB_FILE << EOF
.mode column
.headers on
SELECT status, COUNT(*) as count FROM tasks GROUP BY status;
EOF
    ;;

  "agents")
    echo "🤖 AI Agents"
    echo "============"
    sqlite3 $DB_FILE << EOF
.mode column
.headers on
SELECT slug, name, status, company_id FROM ai_agents;
EOF
    ;;

  "plans")
    echo "💳 Subscription Plans"
    echo "===================="
    sqlite3 $DB_FILE << EOF
.mode column
.headers on
SELECT id, name, tier, price, billing_period FROM subscription_plans;
EOF
    ;;

  "reset")
    echo "⚠️  Resetting database..."
    rm -f $DB_FILE ${DB_FILE}-shm ${DB_FILE}-wal
    echo "✅ Database files deleted"
    echo "ℹ️  Run 'npm run server' to recreate with seed data"
    ;;

  "backup")
    BACKUP_FILE="${DB_FILE}.backup.$(date +%Y%m%d_%H%M%S)"
    cp $DB_FILE $BACKUP_FILE
    echo "✅ Database backed up to: $BACKUP_FILE"
    ;;

  "query")
    if [ -z "$2" ]; then
      echo "Usage: ./db-admin.sh query 'SELECT * FROM users;'"
      exit 1
    fi
    sqlite3 $DB_FILE << EOF
.mode column
.headers on
$2
EOF
    ;;

  "tables")
    echo "📋 All Tables"
    echo "============="
    sqlite3 $DB_FILE ".tables"
    ;;

  "schema")
    if [ -z "$2" ]; then
      echo "Usage: ./db-admin.sh schema <table_name>"
      exit 1
    fi
    echo "📐 Schema for: $2"
    echo "================="
    sqlite3 $DB_FILE ".schema $2"
    ;;

  *)
    echo "CortexBuild Database Admin Tool"
    echo "================================"
    echo ""
    echo "Usage: ./db-admin.sh [command]"
    echo ""
    echo "Commands:"
    echo "  status      - Show database statistics"
    echo "  users       - List all users"
    echo "  projects    - List all projects"
    echo "  tasks       - Show tasks summary"
    echo "  agents      - List AI agents"
    echo "  plans       - Show subscription plans"
    echo "  tables      - List all tables"
    echo "  schema      - Show table schema (requires table name)"
    echo "  query       - Run custom SQL query"
    echo "  backup      - Create database backup"
    echo "  reset       - Delete and reset database"
    echo ""
    echo "Examples:"
    echo "  ./db-admin.sh status"
    echo "  ./db-admin.sh users"
    echo "  ./db-admin.sh schema users"
    echo "  ./db-admin.sh query 'SELECT * FROM users;'"
    echo "  ./db-admin.sh backup"
    ;;
esac
