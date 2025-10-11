# 💾 CortexBuild Database Scripts

Quick access commands for database backup, restore, and monitoring.

---

## 🚀 Quick Commands

### Backup Database

```bash
npm run db:backup
```

Creates a compressed backup with automatic cleanup of old backups (>30 days).

### Restore Database

```bash
npm run db:restore
```

Interactive restore wizard with safety checks.

### Check Database Health

```bash
npm run db:health
```

Shows database size, WAL status, and statistics.

---

## 📖 Detailed Usage

### 1. Database Backup

**Command:**

```bash
npm run db:backup
```

**What it does:**

- ✅ Performs WAL checkpoint
- ✅ Creates backup in `backups/database/`
- ✅ Compresses with gzip
- ✅ Verifies integrity
- ✅ Cleans up old backups (>30 days)

**Output:**

```
╔════════════════════════════════════════════════╗
║   CortexBuild Database Backup System          ║
╚════════════════════════════════════════════════╝

🔄 Step 1: Performing WAL checkpoint...
   ✅ WAL checkpoint completed
💾 Step 2: Creating backup...
   ✅ Backup created: cortexbuild_backup_20251011_200000.db
🗜️  Step 3: Compressing backup...
   ✅ Backup compressed (128K)
🔍 Step 4: Verifying backup integrity...
   ✅ Backup integrity verified
```

**Location:**

```
backups/database/cortexbuild_backup_YYYYMMDD_HHMMSS.db.gz
```

---

### 2. Database Restore

**Command:**

```bash
npm run db:restore
```

**⚠️ IMPORTANT:** Stop the server first!

```bash
# Find and kill server process
lsof -ti:3001 | xargs kill

# Then run restore
npm run db:restore
```

**Interactive Flow:**

```
╔════════════════════════════════════════════════╗
║   CortexBuild Database Restore System         ║
╚════════════════════════════════════════════════╝

📁 Available Backups:

[1] cortexbuild_backup_20251011_200000.db.gz
    Size: 128K
    Date: 2025-10-11 20:00:00

[2] cortexbuild_backup_20251010_020000.db.gz
    Size: 125K
    Date: 2025-10-10 02:00:00

Select backup to restore (1-2) or 'q' to quit:
>
```

**Safety Features:**

- ✅ Checks for running processes
- ✅ Backs up current database before restore
- ✅ Verifies backup integrity
- ✅ Validates restored database

---

### 3. Database Health Check

**Command:**

```bash
npm run db:health
```

**Response:**

```json
{
  "status": "healthy",
  "timestamp": "2025-10-11T20:00:00.000Z",
  "database": {
    "main_db_size": 585728,
    "main_db_size_mb": "0.56",
    "wal_size": 131072,
    "wal_size_mb": "0.13",
    "total_size_mb": "0.71"
  },
  "statistics": {
    "users": 6,
    "projects": 3
  },
  "recommendations": {
    "should_checkpoint": false,
    "message": "Database health is optimal."
  }
}
```

**When to be concerned:**

- ⚠️ WAL size > 10 MB (checkpoint recommended)
- 🚨 WAL size > 50 MB (checkpoint urgent)

---

## 🔧 Direct Script Access

If you prefer to run scripts directly:

```bash
# Make scripts executable
chmod +x scripts/backup-database.sh
chmod +x scripts/restore-database.sh

# Run backup
./scripts/backup-database.sh

# Run restore
./scripts/restore-database.sh
```

---

## ⏰ Automated Backups (Cron)

### Setup Daily Backup at 2 AM

```bash
# Edit crontab
crontab -e

# Add this line:
0 2 * * * cd /Users/admin/Desktop/CortexBuild && npm run db:backup >> logs/backup.log 2>&1
```

### Verify Cron Job

```bash
# List all cron jobs
crontab -l

# Check logs
tail -f logs/backup.log
```

---

## 📁 File Structure

```
CortexBuild/
├── cortexbuild.db           # Main database
├── cortexbuild.db-wal       # Write-Ahead Log
├── cortexbuild.db-shm       # Shared memory
├── backups/
│   └── database/
│       ├── cortexbuild_backup_20251011_200000.db.gz
│       ├── cortexbuild_backup_20251010_020000.db.gz
│       └── cortexbuild_pre_restore_*.db.gz
└── scripts/
    ├── backup-database.sh
    └── restore-database.sh
```

---

## 🆘 Emergency Procedures

### Database Locked

```bash
# Find process
lsof cortexbuild.db

# Kill process
kill <PID>

# Force checkpoint
sqlite3 cortexbuild.db "PRAGMA wal_checkpoint(TRUNCATE);"
```

### WAL Too Large

```bash
# Stop server
lsof -ti:3001 | xargs kill

# Force checkpoint
sqlite3 cortexbuild.db "PRAGMA wal_checkpoint(TRUNCATE);"

# Restart
npm run dev:all
```

### Corrupted Database

```bash
# Check integrity
sqlite3 cortexbuild.db "PRAGMA integrity_check;"

# If corrupted, restore from backup
npm run db:restore
```

---

## 📊 Best Practices

### Daily

- ✅ Monitor `/api/health/database`
- ✅ Check WAL size
- ✅ Verify backup completed

### Weekly

- ✅ Test backup script manually
- ✅ Review backup logs
- ✅ Clear old logs

### Monthly

- ✅ Test restore procedure
- ✅ Archive backups to cloud
- ✅ Review disk space

---

## 🔗 Related Documentation

- `DATABASE_PROTECTION_SYSTEM.md` - Complete protection system docs
- `RECUPERARE_DATE_2025-10-11.md` - Data recovery procedures
- `MISIUNE_COMPLETA_2025-10-11.md` - Full project status

---

## ⚡ Quick Reference

| Task | Command | Time |
|------|---------|------|
| Backup | `npm run db:backup` | ~10s |
| Restore | `npm run db:restore` | ~30s |
| Health | `npm run db:health` | <1s |
| Checkpoint | `sqlite3 cortexbuild.db "PRAGMA wal_checkpoint(TRUNCATE);"` | <5s |

---

**Last Updated:** 11 Octombrie 2025  
**Version:** 2.0.0  
**Status:** ✅ Production Ready
