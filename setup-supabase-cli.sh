#!/bin/bash

# CortexBuild - Supabase CLI Setup & Migration Script
# This script:
# 1. Checks if Supabase CLI is installed
# 2. Sets up Supabase project locally
# 3. Applies database migration
# 4. Verifies migration success

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║     CortexBuild - Database Migration Setup                  ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Step 1: Check if Supabase CLI is installed
echo -e "${BLUE}→${NC} ${CYAN}Checking Supabase CLI Installation${NC}"

if ! command -v supabase &> /dev/null; then
    echo -e "${YELLOW}⚠${NC} Supabase CLI not found. Installing..."

    if command -v npm &> /dev/null; then
        echo -e "${BLUE}→${NC} Installing via npm..."
        npm install -g supabase
    else
        echo -e "${RED}✗${NC} npm not found. Please install Node.js first"
        echo "  Visit: https://nodejs.org/"
        exit 1
    fi
fi

SUPABASE_VERSION=$(supabase --version)
echo -e "${GREEN}✅${NC} Supabase CLI installed: ${SUPABASE_VERSION}"
echo ""

# Step 2: Check if .supabase/config.toml exists
echo -e "${BLUE}→${NC} ${CYAN}Checking Project Configuration${NC}"

PROJECT_DIR="/Users/admin/Projects/cortexbuild/CortexBuild-1"
cd "$PROJECT_DIR"

if [ ! -f ".supabase/config.toml" ]; then
    echo -e "${YELLOW}⚠${NC} Supabase project not initialized locally"
    echo -e "${BLUE}→${NC} You need to link this project to your Supabase account"
    echo ""
    echo "Run this command:"
    echo -e "${YELLOW}  supabase link --project-ref zpbuvuxpfemldsknerew${NC}"
    echo ""
    echo "This will:"
    echo "  1. Authenticate with your Supabase account"
    echo "  2. Link the local project to remote"
    echo "  3. Set up migration tracking"
    echo ""
    exit 0
else
    echo -e "${GREEN}✅${NC} Project already linked"
fi
echo ""

# Step 3: Apply migration
echo -e "${BLUE}→${NC} ${CYAN}Applying Database Migration${NC}"

if [ ! -f "supabase/migrations/004_create_user_profiles_table.sql" ]; then
    echo -e "${RED}✗${NC} Migration file not found"
    exit 1
fi

echo -e "${BLUE}→${NC} Running: supabase db push"
supabase db push

echo ""
echo -e "${GREEN}✅${NC} Migration applied successfully!"
echo ""

# Step 4: Verify migration
echo -e "${BLUE}→${NC} ${CYAN}Verifying Migration${NC}"

echo "To verify the migration was applied:"
echo ""
echo "1. Go to: https://app.supabase.com"
echo "2. Select your project (zpbuvuxpfemldsknerew)"
echo "3. Click 'SQL Editor'"
echo "4. Run this query:"
echo ""
echo -e "${YELLOW}  SELECT table_name FROM information_schema.tables"
echo "  WHERE table_schema = 'public' AND table_name = 'user_profiles';${NC}"
echo ""
echo "5. You should see 'user_profiles' in the results"
echo ""

echo -e "${CYAN}─────────────────────────────────────────────────────────────${NC}"
echo ""
echo -e "${GREEN}✨ Next Steps:${NC}"
echo ""
echo "1. Verify the table in Supabase Dashboard"
echo "2. Test the API endpoint:"
echo "   GET https://cortexbuildcortexbuild-3ebcxu3k7-adrian-b7e84541.vercel.app/api/user/profile"
echo ""
echo "3. Check Vercel logs for any errors"
echo ""
echo "4. Log in to the app and verify profile functionality"
echo ""
