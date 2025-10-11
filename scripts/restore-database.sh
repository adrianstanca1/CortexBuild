#!/bin/bash

###############################################################################
# CortexBuild Database Restore Script
# Restore database from backup with safety checks
###############################################################################

# Configuration
DB_NAME="cortexbuild.db"
BACKUP_DIR="backups/database"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   CortexBuild Database Restore System         ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════╝${NC}"
echo ""

# Check if backup directory exists
if [ ! -d "$BACKUP_DIR" ]; then
    echo -e "${RED}❌ Error: Backup directory '$BACKUP_DIR' not found!${NC}"
    exit 1
fi

# List available backups
echo -e "${YELLOW}📁 Available Backups:${NC}"
echo ""
BACKUPS=($(find "$BACKUP_DIR" -name "cortexbuild_backup_*.db.gz" -type f -printf "%p\n" | sort -r))

if [ ${#BACKUPS[@]} -eq 0 ]; then
    echo -e "${RED}❌ No backups found in '$BACKUP_DIR'${NC}"
    exit 1
fi

# Display backups with numbers
for i in "${!BACKUPS[@]}"; do
    BACKUP_FILE="${BACKUPS[$i]}"
    BACKUP_NAME=$(basename "$BACKUP_FILE")
    BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    BACKUP_DATE=$(stat -f "%Sm" -t "%Y-%m-%d %H:%M:%S" "$BACKUP_FILE" 2>/dev/null || stat -c "%y" "$BACKUP_FILE" 2>/dev/null | cut -d'.' -f1)
    
    echo -e "${GREEN}[$((i+1))]${NC} $BACKUP_NAME"
    echo "    Size: $BACKUP_SIZE"
    echo "    Date: $BACKUP_DATE"
    echo ""
done

# Prompt user to select backup
echo -e "${YELLOW}Select backup to restore (1-${#BACKUPS[@]}) or 'q' to quit:${NC}"
read -p "> " SELECTION

# Validate input
if [ "$SELECTION" = "q" ] || [ "$SELECTION" = "Q" ]; then
    echo "Restore cancelled."
    exit 0
fi

if ! [[ "$SELECTION" =~ ^[0-9]+$ ]] || [ "$SELECTION" -lt 1 ] || [ "$SELECTION" -gt ${#BACKUPS[@]} ]; then
    echo -e "${RED}❌ Invalid selection!${NC}"
    exit 1
fi

# Get selected backup
SELECTED_BACKUP="${BACKUPS[$((SELECTION-1))]}"
SELECTED_NAME=$(basename "$SELECTED_BACKUP")

echo ""
echo -e "${YELLOW}⚠️  WARNING: This will REPLACE the current database!${NC}"
echo -e "${YELLOW}Current database will be backed up first.${NC}"
echo ""
echo "Selected backup: $SELECTED_NAME"
echo ""
read -p "Are you sure you want to continue? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    echo "Restore cancelled."
    exit 0
fi

# Step 1: Check if any processes are using the database
echo ""
echo -e "${YELLOW}🔍 Step 1: Checking for running processes...${NC}"
if lsof "$DB_NAME" > /dev/null 2>&1; then
    echo -e "${RED}   ❌ Database is currently in use!${NC}"
    echo -e "${RED}   Please stop the server first:${NC}"
    echo -e "${RED}   npm run stop  or  killall node${NC}"
    exit 1
else
    echo -e "${GREEN}   ✅ No processes using database${NC}"
fi

# Step 2: Backup current database
echo -e "${YELLOW}💾 Step 2: Backing up current database...${NC}"
CURRENT_BACKUP="$BACKUP_DIR/cortexbuild_pre_restore_$(date +%Y%m%d_%H%M%S).db"
if [ -f "$DB_NAME" ]; then
    cp "$DB_NAME" "$CURRENT_BACKUP"
    gzip "$CURRENT_BACKUP"
    echo -e "${GREEN}   ✅ Current database backed up: $(basename $CURRENT_BACKUP).gz${NC}"
else
    echo -e "${YELLOW}   ⚠️  No existing database to backup${NC}"
fi

# Step 3: Decompress backup
echo -e "${YELLOW}🗜️  Step 3: Decompressing backup...${NC}"
TEMP_BACKUP="/tmp/cortexbuild_restore_temp.db"
gunzip -c "$SELECTED_BACKUP" > "$TEMP_BACKUP"
if [ $? -eq 0 ]; then
    echo -e "${GREEN}   ✅ Backup decompressed${NC}"
else
    echo -e "${RED}   ❌ Failed to decompress backup${NC}"
    exit 1
fi

# Step 4: Verify backup integrity
echo -e "${YELLOW}🔍 Step 4: Verifying backup integrity...${NC}"
sqlite3 "$TEMP_BACKUP" "PRAGMA integrity_check;" > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo -e "${GREEN}   ✅ Backup integrity verified${NC}"
else
    echo -e "${RED}   ❌ Backup is corrupted!${NC}"
    rm -f "$TEMP_BACKUP"
    exit 1
fi

# Step 5: Restore database
echo -e "${YELLOW}♻️  Step 5: Restoring database...${NC}"
rm -f "$DB_NAME" "${DB_NAME}-wal" "${DB_NAME}-shm"
mv "$TEMP_BACKUP" "$DB_NAME"
if [ $? -eq 0 ]; then
    echo -e "${GREEN}   ✅ Database restored successfully${NC}"
else
    echo -e "${RED}   ❌ Failed to restore database${NC}"
    exit 1
fi

# Step 6: Verify restored database
echo -e "${YELLOW}🔍 Step 6: Verifying restored database...${NC}"
USER_COUNT=$(sqlite3 "$DB_NAME" "SELECT COUNT(*) FROM users;" 2>/dev/null)
PROJECT_COUNT=$(sqlite3 "$DB_NAME" "SELECT COUNT(*) FROM projects;" 2>/dev/null)

if [ $? -eq 0 ]; then
    echo -e "${GREEN}   ✅ Database verification passed${NC}"
    echo "   Users: $USER_COUNT"
    echo "   Projects: $PROJECT_COUNT"
else
    echo -e "${RED}   ❌ Database verification failed${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   ✅ Restore Completed Successfully!          ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════╝${NC}"
echo ""
echo "Restored from: $SELECTED_NAME"
echo "Users in database: $USER_COUNT"
echo "Projects in database: $PROJECT_COUNT"
echo ""
echo -e "${YELLOW}⚡ You can now start the server:${NC}"
echo "   npm run dev:all"
echo ""

exit 0
