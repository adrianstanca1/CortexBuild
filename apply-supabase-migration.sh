#!/bin/bash

# Apply Supabase Migration - Create Test Users
# This script executes the migration SQL directly against Supabase

SUPABASE_URL="https://zpbuvuxpfemldsknerew.supabase.co"
MIGRATION_FILE="supabase/migrations/004_create_test_users.sql"

echo "🚀 Applying Supabase Migration: Create Test Users"
echo "=================================================="
echo ""

# Check if .env.production.local exists
if [ ! -f .env.production.local ]; then
    echo "❌ Error: .env.production.local not found"
    echo "Please create this file with SUPABASE_SERVICE_ROLE_KEY"
    exit 1
fi

# Load environment variables
source .env.production.local

# Check if service key is set
if [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo "❌ Error: SUPABASE_SERVICE_ROLE_KEY not set"
    echo "Please add it to .env.production.local"
    exit 1
fi

# Check if migration file exists
if [ ! -f "$MIGRATION_FILE" ]; then
    echo "❌ Error: Migration file not found: $MIGRATION_FILE"
    exit 1
fi

echo "📄 Migration file: $MIGRATION_FILE"
echo "🔗 Supabase URL: $SUPABASE_URL"
echo ""

# Read the SQL file
SQL_CONTENT=$(cat "$MIGRATION_FILE")

# Execute the migration using Supabase REST API
echo "⚙️  Executing migration..."
echo ""

RESPONSE=$(curl -s -X POST \
    "${SUPABASE_URL}/rest/v1/rpc/exec_sql" \
    -H "apikey: ${SUPABASE_SERVICE_ROLE_KEY}" \
    -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}" \
    -H "Content-Type: application/json" \
    -d "{\"query\": $(echo "$SQL_CONTENT" | jq -Rs .)}")

if [ $? -eq 0 ]; then
    echo "✅ Migration executed successfully!"
    echo ""
    echo "Test accounts created:"
    echo "  📧 dev@constructco.com (developer)"
    echo "     Password: parola123"
    echo ""
    echo "  📧 adrian@ascladdingltd.co.uk (company_admin)"
    echo "     Password: Lolozania1"
    echo ""
    echo "You can now login at: https://cortexbuildcortexbuild-i7ok8e0bs-adrian-b7e84541.vercel.app"
else
    echo "❌ Migration failed!"
    echo "Response: $RESPONSE"
    exit 1
fi
