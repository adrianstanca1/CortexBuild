# 🗄️ CortexBuild - Database Integration Guide

**Data:** 31 Octombrie 2025  
**Status:** Integrare Supabase în curs

---

## 📋 **Situație Actuală**

### ✅ **Ce este deja gata:**
- ✅ Configurație Supabase în `.env.local`
- ✅ Client Supabase configurat (`lib/supabase/client.ts` și `server/supabase.ts`)
- ✅ Rute Phase 1 migrate la Supabase (gantt, wbs, budgets)
- ✅ Ruta `clients` migrată la Supabase

### ⏳ **Ce trebuie făcut:**
- ⏳ Aplicare migrări de bază de date
- ⏳ Migrare restul rutelor API la Supabase
- ⏳ Testare funcționalitate completă

---

## 🚀 **Pași pentru Integrare Completă**

### **Step 1: Aplicare Migrări de Bază de Date**

**Opțiunea A - Via Supabase Dashboard (RECOMANDAT):**

1. **Deschide Supabase Dashboard:**
   ```
   https://app.supabase.com/project/zpbuvuxpfemldsknerew
   ```

2. **Mergi la SQL Editor**

3. **Aplică migrările în ordine:**
   - `supabase/migrations/001_multi_tenant_schema.sql`
   - `supabase/migrations/002_admin_platform_schema.sql`
   - `supabase/migrations/003_enhanced_rls_security.sql`
   - `supabase/migrations/20251031000000_phase_1_enterprise_core.sql`
   - `supabase/COMPLETE_SCHEMA.sql` (pentru asigurarea tuturor tabelelor)

4. **Verifică că toate tabelele există** în Table Editor

**Opțiunea B - Via Script:**

```bash
# Verifică configurația Supabase
npm run verify:supabase

# Aplică migrările (dacă scriptul funcționează)
npm run migrate:supabase
```

### **Step 2: Verificare Conectivitate**

```bash
# Testează conexiunea la Supabase
npm run verify:supabase
```

Această comandă va:
- Verifica conexiunea la Supabase
- Lista tabelele existente
- Verifica dacă toate tabelele critice există

### **Step 3: Actualizare Parole (Opțional)**

Dacă ai aplicat schema cu parole placeholder, actualizează-le în Supabase SQL Editor:

```sql
-- Actualizează parolele cu bcrypt hashes reale
UPDATE users 
SET password_hash = crypt('parola123', gen_salt('bf', 10))
WHERE email = 'adrian.stanca1@gmail.com';

UPDATE users 
SET password_hash = crypt('lolozania1', gen_salt('bf', 10))
WHERE email = 'adrian@ascladdingltd.co.uk';
```

### **Step 4: Testare Server**

```bash
# Pornește serverul backend
npm run server

# În alt terminal, testează API-urile
curl http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"adrian.stanca1@gmail.com","password":"parola123"}'
```

---

## 📊 **Status Migrare Rute API**

### ✅ **Rute Migrate la Supabase:**
- ✅ `/api/gantt` - Gantt charts
- ✅ `/api/wbs` - Work Breakdown Structure
- ✅ `/api/budgets` - Project budgets
- ✅ `/api/clients` - Client management

### ⏳ **Rute Necesare Migrare:**
- ⏳ `/api/projects` - Projects management
- ⏳ `/api/tasks` - Tasks management
- ⏳ `/api/rfis` - RFI management
- ⏳ `/api/invoices` - Invoices
- ⏳ `/api/time-entries` - Time tracking
- ⏳ `/api/subcontractors` - Subcontractors
- ⏳ `/api/purchase-orders` - Purchase orders
- ⏳ `/api/milestones` - Milestones
- ⏳ `/api/documents` - Documents
- ⏳ `/api/modules` - Modules
- ⏳ `/api/admin` - Admin functions
- ⏳ `/api/marketplace` - Marketplace
- ⏳ `/api/sdk` - SDK routes
- ⏳ ... și multe altele

---

## 🔧 **Model pentru Migrare Rute**

Exemplu de migrare de la SQLite la Supabase:

**Înainte (SQLite):**
```typescript
import Database from 'better-sqlite3';

export function createMyRouter(db: Database.Database): Router {
  const router = Router();
  
  router.get('/', (req, res) => {
    const data = db.prepare('SELECT * FROM table').all();
    res.json({ success: true, data });
  });
}
```

**După (Supabase):**
```typescript
import { SupabaseClient } from '@supabase/supabase-js';

export function createMyRouter(supabase: SupabaseClient): Router {
  const router = Router();
  
  router.get('/', async (req, res) => {
    const { data, error } = await supabase
      .from('table')
      .select('*');
    
    if (error) throw error;
    res.json({ success: true, data });
  });
}
```

---

## 📝 **Schema Bază de Date**

### **Tabele Critice:**
- `companies` - Companiile (multi-tenant)
- `users` - Utilizatorii
- `projects` - Proiecte
- `project_tasks_gantt` - Tasks pentru Gantt
- `wbs_structure` - Work Breakdown Structure
- `project_budgets` - Budgeturi proiect
- `payment_applications` - Aplicații de plată
- `clients` - Clienți
- `tasks` - Tasks generale
- `rfis` - RFI-uri
- `invoices` - Facturi
- ... și multe altele

### **Referințe:**
- Schema completă: `supabase/COMPLETE_SCHEMA.sql`
- Migrări Phase 1: `supabase/migrations/20251031000000_phase_1_enterprise_core.sql`

---

## ✅ **Checklist Finale**

### **Bază de Date:**
- [ ] Toate migrările aplicate în Supabase
- [ ] Toate tabelele create
- [ ] Indexurile create
- [ ] RLS policies configurate
- [ ] Parolele actualizate

### **Backend:**
- [ ] Toate rutele API migrate la Supabase
- [ ] Serverul pornește fără erori
- [ ] API-urile funcționează corect
- [ ] Autentificarea funcționează

### **Frontend:**
- [ ] Client Supabase configurat corect
- [ ] Aplicația se conectează la Supabase
- [ ] Toate funcțiile funcționează

---

## 🐛 **Troubleshooting**

### **Eroare: "Table does not exist"**
- Verifică că migrările au fost aplicate
- Verifică numele tabelelor în Supabase dashboard

### **Eroare: "Permission denied"**
- Verifică RLS policies
- Verifică că folosești service role key pentru backend

### **Eroare: "Connection failed"**
- Verifică variabilele de mediu în `.env.local`
- Verifică că Supabase URL și chei sunt corecte

---

## 📞 **Suport**

Dacă întâmpinați probleme:
1. Verifică logurile serverului
2. Verifică Supabase logs în dashboard
3. Rulați `npm run verify:supabase` pentru diagnosticare

---

## 🎯 **Următorii Pași**

1. **Aplică toate migrările** în Supabase dashboard
2. **Migrează restul rutelor** folosind modelul de mai sus
3. **Testează funcționalitatea completă**
4. **Deploy la producție**

---

**Status:** Work in progress - Continuăm cu migrarea tuturor rutelor! 🚀

