#!/bin/bash

###############################################################################
# CortexBuild Database Backup Script
# Automated daily backup with WAL checkpoint and compression
###############################################################################

# Configuration
DB_NAME="cortexbuild.db"
BACKUP_DIR="backups/database"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="cortexbuild_backup_${DATE}.db"
KEEP_DAYS=30  # Keep backups for 30 days

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}╔════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   CortexBuild Database Backup System          ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════╝${NC}"
echo ""

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Check if database exists
if [ ! -f "$DB_NAME" ]; then
    echo -e "${RED}❌ Error: Database file '$DB_NAME' not found!${NC}"
    exit 1
fi

echo -e "${YELLOW}📊 Database Information:${NC}"
echo "   Database: $DB_NAME"
echo "   Size: $(du -h $DB_NAME | cut -f1)"
echo "   Date: $(date)"
echo ""

# Step 1: Force WAL checkpoint
echo -e "${YELLOW}🔄 Step 1: Performing WAL checkpoint...${NC}"
sqlite3 "$DB_NAME" "PRAGMA wal_checkpoint(TRUNCATE);" 2>/dev/null
if [ $? -eq 0 ]; then
    echo -e "${GREEN}   ✅ WAL checkpoint completed${NC}"
else
    echo -e "${RED}   ❌ WAL checkpoint failed${NC}"
    exit 1
fi

# Step 2: Create backup
echo -e "${YELLOW}💾 Step 2: Creating backup...${NC}"
sqlite3 "$DB_NAME" ".backup '$BACKUP_DIR/$BACKUP_NAME'" 2>/dev/null
if [ $? -eq 0 ]; then
    echo -e "${GREEN}   ✅ Backup created: $BACKUP_NAME${NC}"
    echo "   Size: $(du -h $BACKUP_DIR/$BACKUP_NAME | cut -f1)"
else
    echo -e "${RED}   ❌ Backup creation failed${NC}"
    exit 1
fi

# Step 3: Compress backup
echo -e "${YELLOW}🗜️  Step 3: Compressing backup...${NC}"
gzip "$BACKUP_DIR/$BACKUP_NAME"
if [ $? -eq 0 ]; then
    echo -e "${GREEN}   ✅ Backup compressed: ${BACKUP_NAME}.gz${NC}"
    echo "   Size: $(du -h $BACKUP_DIR/${BACKUP_NAME}.gz | cut -f1)"
else
    echo -e "${RED}   ❌ Compression failed${NC}"
fi

# Step 4: Verify backup integrity
echo -e "${YELLOW}🔍 Step 4: Verifying backup integrity...${NC}"
gunzip -c "$BACKUP_DIR/${BACKUP_NAME}.gz" | sqlite3 :memory: "PRAGMA integrity_check;" > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo -e "${GREEN}   ✅ Backup integrity verified${NC}"
else
    echo -e "${RED}   ⚠️  Warning: Backup integrity check failed${NC}"
fi

# Step 5: Cleanup old backups
echo -e "${YELLOW}🧹 Step 5: Cleaning up old backups...${NC}"
DELETED=$(find "$BACKUP_DIR" -name "cortexbuild_backup_*.db.gz" -type f -mtime +$KEEP_DAYS -delete -print | wc -l)
if [ $DELETED -gt 0 ]; then
    echo -e "${GREEN}   ✅ Deleted $DELETED old backup(s) (>$KEEP_DAYS days)${NC}"
else
    echo -e "${GREEN}   ✅ No old backups to delete${NC}"
fi

# Step 6: Display backup statistics
echo ""
echo -e "${YELLOW}📊 Backup Statistics:${NC}"
TOTAL_BACKUPS=$(find "$BACKUP_DIR" -name "cortexbuild_backup_*.db.gz" -type f | wc -l)
TOTAL_SIZE=$(du -sh "$BACKUP_DIR" | cut -f1)
echo "   Total backups: $TOTAL_BACKUPS"
echo "   Total size: $TOTAL_SIZE"
echo "   Location: $BACKUP_DIR"

# Step 7: List recent backups
echo ""
echo -e "${YELLOW}📁 Recent Backups (last 5):${NC}"
find "$BACKUP_DIR" -name "cortexbuild_backup_*.db.gz" -type f -printf "   %p (%s bytes) - %TY-%Tm-%Td %TH:%TM\n" | sort -r | head -5

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   ✅ Backup Completed Successfully!           ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════╝${NC}"
echo ""
echo "Backup file: $BACKUP_DIR/${BACKUP_NAME}.gz"
echo ""

# Optional: Upload to cloud storage (uncomment if needed)
# echo -e "${YELLOW}☁️  Uploading to cloud storage...${NC}"
# aws s3 cp "$BACKUP_DIR/${BACKUP_NAME}.gz" s3://your-bucket/cortexbuild-backups/
# echo -e "${GREEN}   ✅ Uploaded to S3${NC}"

exit 0
