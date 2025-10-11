# 🛡️ Database Protection System - CortexBuild

**Implementat:** 11 Octombrie 2025  
**Versiune:** 2.0.0  
**Status:** ✅ Protecție Completă Activată

---

## 📋 CUPRINS

1. [Sistem Protecție Implementat](#sistem-protecție-implementat)
2. [Graceful Shutdown Handlers](#graceful-shutdown-handlers)
3. [Database Health Monitoring](#database-health-monitoring)
4. [Backup Automation](#backup-automation)
5. [Restore Procedures](#restore-procedures)
6. [Usage Guide](#usage-guide)
7. [Troubleshooting](#troubleshooting)

---

## 🛡️ SISTEM PROTECȚIE IMPLEMENTAT

### Componente Active

| Componenta | Fișier | Status | Funcție |
|-----------|--------|--------|---------|
| **Graceful Shutdown** | `server/database.ts` | ✅ Active | Previne pierderea datelor la închidere |
| **WAL Checkpoint** | `server/database.ts` | ✅ Active | Periodic flush (30 min) |
| **Health Monitoring** | `server/index.ts` | ✅ Active | Monitorizare în timp real |
| **Backup Script** | `scripts/backup-database.sh` | ✅ Ready | Backup automat cu compresie |
| **Restore Script** | `scripts/restore-database.sh` | ✅ Ready | Restore sigur cu verificări |

---

## 🔄 GRACEFUL SHUTDOWN HANDLERS

### Implementare (server/database.ts)

```typescript
// WAL Configuration
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');
db.pragma('synchronous = NORMAL');
db.pragma('cache_size = 10000'); // 10MB cache

// Graceful Shutdown Function
const gracefulShutdown = (signal: string) => {
    console.log(`\n🔄 Received ${signal}, shutting down gracefully...`);
    try {
        console.log('💾 Performing WAL checkpoint...');
        db.pragma('wal_checkpoint(TRUNCATE)');
        console.log('✅ WAL checkpoint completed');
        
        console.log('🔒 Closing database connection...');
        db.close();
        console.log('✅ Database closed successfully');
        
        console.log('👋 Shutdown complete');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error during shutdown:', error);
        process.exit(1);
    }
};

// Register handlers for all kill signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGHUP', () => gracefulShutdown('SIGHUP'));
```

### Periodic WAL Checkpoint

```typescript
// Auto-checkpoint every 30 minutes
setInterval(() => {
    try {
        const result = db.pragma('wal_checkpoint(PASSIVE)');
        console.log('🔄 Periodic WAL checkpoint:', result);
    } catch (error) {
        console.error('❌ Periodic checkpoint failed:', error);
    }
}, 30 * 60 * 1000); // 30 minutes
```

### Cum Funcționează

1. **La Ctrl+C sau kill signal:**
   - Interceptează semnalul SIGTERM/SIGINT
   - Execută WAL checkpoint (TRUNCATE mode)
   - Închide database connection clean
   - Exit cu cod 0 (success)

2. **Periodic (la fiecare 30 min):**
   - Rulează PASSIVE checkpoint
   - Nu blochează operațiunile
   - Reduce WAL file size gradual

3. **La eroare:**
   - Log detailed error
   - Exit cu cod 1 (error)

---

## 📊 DATABASE HEALTH MONITORING

### API Endpoint

**GET** `/api/health/database` (requires authentication)

### Response Example

```json
{
  "status": "healthy",
  "timestamp": "2025-10-11T19:45:30.123Z",
  "database": {
    "main_db_size": 585728,
    "main_db_size_mb": "0.56",
    "wal_size": 131072,
    "wal_size_mb": "0.13",
    "shm_size": 32768,
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

### Când să Alarmezi

| Condiție | Threshold | Acțiune |
|----------|-----------|---------|
| WAL Size | > 10 MB | Manual checkpoint recomandat |
| WAL Size | > 50 MB | Checkpoint urgent necesar |
| WAL Size | > 100 MB | Investigare problemă |
| Main DB | > 1 GB | Consideră arhivare/curățare |

### Cum să Folosești

```bash
# Cu curl (din terminal)
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3001/api/health/database

# În browser (după autentificare)
http://localhost:3001/api/health/database
```

---

## 💾 BACKUP AUTOMATION

### Script: `scripts/backup-database.sh`

**Funcționalități:**

- ✅ WAL checkpoint automat înainte de backup
- ✅ Verificare integritate backup
- ✅ Compresie automată (gzip)
- ✅ Cleanup backupuri vechi (>30 zile)
- ✅ Statistici detaliate
- ✅ Color-coded output

### Manual Run

```bash
# Dă permisiuni execute
chmod +x scripts/backup-database.sh

# Rulează backup
./scripts/backup-database.sh
```

### Output Example

```
╔════════════════════════════════════════════════╗
║   CortexBuild Database Backup System          ║
╚════════════════════════════════════════════════╝

📊 Database Information:
   Database: cortexbuild.db
   Size: 572K
   Date: Fri Oct 11 19:45:30 EEST 2025

🔄 Step 1: Performing WAL checkpoint...
   ✅ WAL checkpoint completed
💾 Step 2: Creating backup...
   ✅ Backup created: cortexbuild_backup_20251011_194530.db
   Size: 572K
🗜️  Step 3: Compressing backup...
   ✅ Backup compressed: cortexbuild_backup_20251011_194530.db.gz
   Size: 128K
🔍 Step 4: Verifying backup integrity...
   ✅ Backup integrity verified
🧹 Step 5: Cleaning up old backups...
   ✅ No old backups to delete

📊 Backup Statistics:
   Total backups: 5
   Total size: 640K
   Location: backups/database

╔════════════════════════════════════════════════╗
║   ✅ Backup Completed Successfully!           ║
╚════════════════════════════════════════════════╝
```

### Automated Daily Backups (Cron)

```bash
# Editează crontab
crontab -e

# Adaugă linie pentru backup zilnic la 2 AM
0 2 * * * cd /path/to/CortexBuild && ./scripts/backup-database.sh >> logs/backup.log 2>&1
```

### Backup la Cloud (Optional)

Decomentează în script:

```bash
# Upload to AWS S3
aws s3 cp "$BACKUP_DIR/${BACKUP_NAME}.gz" \
  s3://your-bucket/cortexbuild-backups/

# Upload to Google Cloud Storage
gsutil cp "$BACKUP_DIR/${BACKUP_NAME}.gz" \
  gs://your-bucket/cortexbuild-backups/
```

---

## ♻️ RESTORE PROCEDURES

### Script: `scripts/restore-database.sh`

**Funcționalități:**

- ✅ Listare toate backupurile disponibile
- ✅ Selecție interactivă
- ✅ Backup automat înainte de restore
- ✅ Verificare proces în uz
- ✅ Validare integritate backup
- ✅ Verificare database după restore
- ✅ Safety checks multiple

### Cum să Restaurezi

```bash
# Dă permisiuni execute
chmod +x scripts/restore-database.sh

# Oprește serverul MAI ÎNTÂI!
lsof -ti:3001 | xargs kill

# Rulează restore
./scripts/restore-database.sh
```

### Interactive Flow

```
╔════════════════════════════════════════════════╗
║   CortexBuild Database Restore System         ║
╚════════════════════════════════════════════════╝

📁 Available Backups:

[1] cortexbuild_backup_20251011_194530.db.gz
    Size: 128K
    Date: 2025-10-11 19:45:30

[2] cortexbuild_backup_20251010_020000.db.gz
    Size: 125K
    Date: 2025-10-10 02:00:00

Select backup to restore (1-2) or 'q' to quit:
> 1

⚠️  WARNING: This will REPLACE the current database!
Current database will be backed up first.

Selected backup: cortexbuild_backup_20251011_194530.db.gz

Are you sure you want to continue? (yes/no): yes

🔍 Step 1: Checking for running processes...
   ✅ No processes using database
💾 Step 2: Backing up current database...
   ✅ Current database backed up: cortexbuild_pre_restore_20251011_200000.db.gz
🗜️  Step 3: Decompressing backup...
   ✅ Backup decompressed
🔍 Step 4: Verifying backup integrity...
   ✅ Backup integrity verified
♻️  Step 5: Restoring database...
   ✅ Database restored successfully
🔍 Step 6: Verifying restored database...
   ✅ Database verification passed
   Users: 6
   Projects: 3

╔════════════════════════════════════════════════╗
║   ✅ Restore Completed Successfully!          ║
╚════════════════════════════════════════════════╝

Restored from: cortexbuild_backup_20251011_194530.db.gz
Users in database: 6
Projects in database: 3

⚡ You can now start the server:
   npm run dev:all
```

---

## 📖 USAGE GUIDE

### Daily Operations

#### 1. Start Server (Normal)

```bash
npm run dev:all
```

**Ce se întâmplă:**

- Database se deschide în WAL mode
- Graceful shutdown handlers active
- Periodic checkpoints (30 min)

#### 2. Stop Server (Safe)

**✅ CORECT:**

```bash
# Ctrl+C în terminal (recomandant)
# Sau:
kill $(lsof -ti:3001)
```

**❌ GREȘIT:**

```bash
kill -9 $(lsof -ti:3001)  # Force kill, no cleanup!
```

#### 3. Monitoring

```bash
# Check database health
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3001/api/health/database

# Check WAL size
ls -lh cortexbuild.db*
```

#### 4. Manual Checkpoint

```bash
# If WAL gets too large
sqlite3 cortexbuild.db "PRAGMA wal_checkpoint(TRUNCATE);"
```

### Weekly Maintenance

```bash
# Sunday 3 AM - Full backup + cleanup
0 3 * * 0 cd /path/to/CortexBuild && ./scripts/backup-database.sh
```

### Monthly Maintenance

1. Review backup logs
2. Test restore process
3. Archive old backups to cloud
4. Database integrity check

```bash
sqlite3 cortexbuild.db "PRAGMA integrity_check;"
```

---

## 🔧 TROUBLESHOOTING

### Problem: WAL File Getting Too Large

**Symptoms:**

```bash
ls -lh cortexbuild.db-wal
# -rw-r--r--  50M  cortexbuild.db-wal  # TOO LARGE!
```

**Solution:**

```bash
# Stop server
lsof -ti:3001 | xargs kill

# Force checkpoint
sqlite3 cortexbuild.db "PRAGMA wal_checkpoint(TRUNCATE);"

# Restart server
npm run dev:all
```

**Prevention:**

- Ensure periodic checkpoint is running
- Check server logs pentru errors

### Problem: Database Locked

**Symptoms:**

```
Error: database is locked
```

**Solution:**

```bash
# Find process holding lock
lsof cortexbuild.db

# Kill process gracefully
kill <PID>

# If stuck, force kill
kill -9 <PID>

# Checkpoint and restart
sqlite3 cortexbuild.db "PRAGMA wal_checkpoint(TRUNCATE);"
```

### Problem: Corrupted Database

**Symptoms:**

```
Error: database disk image is malformed
```

**Solution:**

```bash
# Check integrity
sqlite3 cortexbuild.db "PRAGMA integrity_check;"

# If corrupted, restore from backup
./scripts/restore-database.sh

# Select most recent good backup
```

### Problem: Backup Failed

**Check:**

```bash
# Disk space
df -h

# Permissions
ls -la backups/database/

# Database locked?
lsof cortexbuild.db
```

---

## ✅ CHECKLIST ZILNIC

- [ ] Server pornit cu `npm run dev:all`
- [ ] Check `/api/health/database` status
- [ ] WAL size < 10MB
- [ ] Backup automated running (check logs)
- [ ] Disk space > 1GB free

## ✅ CHECKLIST SĂPTĂMÂNAL

- [ ] Test backup script manual
- [ ] Review backup logs
- [ ] Database integrity check
- [ ] Clear old logs (>30 days)

## ✅ CHECKLIST LUNAR

- [ ] Test restore procedure
- [ ] Archive backups to cloud
- [ ] Review monitoring stats
- [ ] Update documentation

---

## 🎯 BEST PRACTICES SUMMARY

### ✅ DO

1. **Always stop server gracefully** (Ctrl+C, not kill -9)
2. **Monitor WAL size regularly** via `/api/health/database`
3. **Run daily automated backups**
4. **Test restore monthly**
5. **Keep 30 days of backups minimum**
6. **Archive important backups to cloud**

### ❌ DON'T

1. **Never force kill server** (kill -9)
2. **Never edit database while server running**
3. **Never delete WAL files manually**
4. **Never skip integrity checks**
5. **Never run without backups**
6. **Never restore without testing first**

---

## 📞 SUPPORT

**Issue?** Check logs:

```bash
tail -f logs/backup.log
tail -f server/logs/database.log
```

**Emergency Restore:**

```bash
./scripts/restore-database.sh
```

---

**Sistem implementat:** 11 Octombrie 2025  
**Status:** ✅ Production Ready  
**Testare:** Completă  

**Contributors:**

- GitHub Copilot (Implementation)
- Augment Agent (Verification)

---

*Document part of CortexBuild Database Protection Suite v2.0.0*
