# 🏢 Multi-Tenant Architecture - ConstructAI

## 📋 **Overview**

Transformarea ConstructAI dintr-un prototip într-o platformă SaaS multi-tenant robustă, scalabilă și sigură, capabilă să servească simultan mai mulți clienți (companii de construcții).

---

## 🎯 **Conceptul Multi-Tenant**

### Definiție
O singură instanță a aplicației și bazei de date servește mai mulți clienți diferiți (tenants). Fiecare client este izolat logic, dar partajează aceeași infrastructură.

### Avantaje
- ✅ **Eficiență** - O singură instanță pentru toți clienții
- ✅ **Scalabilitate** - Ușor de adăugat noi clienți
- ✅ **Mentenanță** - Update-uri centralizate
- ✅ **Cost-eficient** - Resurse partajate

### Provocări
- 🔒 **Izolarea Datelor** - Datele companiei A nu pot fi accesate de compania B
- 🔐 **Securitate** - Reguli stricte de acces
- 📊 **Performance** - Optimizare pentru multi-tenancy

---

## 🗄️ **Schema Bazei de Date (Supabase/PostgreSQL)**

### 1. **Tabel: companies (Tenants)**

```sql
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL, -- pentru URL-uri
    plan VARCHAR(50) NOT NULL DEFAULT 'free', -- free, professional, enterprise
    status VARCHAR(50) NOT NULL DEFAULT 'active', -- active, suspended, cancelled
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_companies_slug ON companies(slug);
CREATE INDEX idx_companies_status ON companies(status);
```

**Exemplu date:**
```json
{
    "id": "comp_abc123",
    "name": "Constructor SRL",
    "slug": "constructor-srl",
    "plan": "professional",
    "status": "active",
    "settings": {
        "timezone": "Europe/Bucharest",
        "currency": "RON",
        "features": ["ml_analytics", "ai_agents"]
    }
}
```

---

### 2. **Tabel: users (Utilizatori)**

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY, -- Supabase Auth ID
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL, -- super_admin, company_admin, project_manager, etc.
    avatar TEXT,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_users_company_id ON users(company_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- RLS (Row Level Security)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see users from their company
CREATE POLICY users_isolation_policy ON users
    FOR ALL
    USING (company_id = (
        SELECT company_id FROM users WHERE id = auth.uid()
    ));
```

**Exemplu date:**
```json
{
    "id": "auth_user_ion",
    "company_id": "comp_abc123",
    "email": "ion.popescu@constructor-srl.com",
    "name": "Ion Popescu",
    "role": "project_manager",
    "avatar": "https://...",
    "settings": {
        "notifications": true,
        "language": "ro"
    }
}
```

---

### 3. **Tabel: projects (Proiecte)**

```sql
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    location VARCHAR(255),
    status VARCHAR(50) NOT NULL DEFAULT 'planning',
    budget DECIMAL(15, 2),
    start_date DATE,
    end_date DATE,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_projects_company_id ON projects(company_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_created_by ON projects(created_by);

-- RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY projects_isolation_policy ON projects
    FOR ALL
    USING (company_id = (
        SELECT company_id FROM users WHERE id = auth.uid()
    ));
```

---

### 4. **Tabel: tasks (Sarcini)**

```sql
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'todo',
    priority VARCHAR(50) DEFAULT 'medium',
    assigned_to UUID REFERENCES users(id),
    due_date DATE,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_tasks_company_id ON tasks(company_id);
CREATE INDEX idx_tasks_project_id ON tasks(project_id);
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX idx_tasks_status ON tasks(status);

-- RLS
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY tasks_isolation_policy ON tasks
    FOR ALL
    USING (company_id = (
        SELECT company_id FROM users WHERE id = auth.uid()
    ));
```

---

### 5. **Tabel: agents (Piața de Agenți AI)**

```sql
CREATE TABLE agents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    category VARCHAR(100), -- safety, quality, budget, etc.
    price_monthly DECIMAL(10, 2),
    features JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_agents_slug ON agents(slug);
CREATE INDEX idx_agents_category ON agents(category);
CREATE INDEX idx_agents_is_active ON agents(is_active);
```

**Exemplu date:**
```json
{
    "id": "agent_hse_sentinel",
    "name": "HSE Sentinel AI",
    "slug": "hse-sentinel-ai",
    "description": "AI-powered safety monitoring and compliance",
    "category": "safety",
    "price_monthly": 49.99,
    "features": [
        "Real-time safety monitoring",
        "Automated incident reporting",
        "Compliance tracking"
    ],
    "is_active": true
}
```

---

### 6. **Tabel: subscriptions (Abonamente per Companie)**

```sql
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL DEFAULT 'active', -- active, cancelled, expired
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(company_id, agent_id)
);

-- Indexes
CREATE INDEX idx_subscriptions_company_id ON subscriptions(company_id);
CREATE INDEX idx_subscriptions_agent_id ON subscriptions(agent_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);

-- RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY subscriptions_isolation_policy ON subscriptions
    FOR ALL
    USING (company_id = (
        SELECT company_id FROM users WHERE id = auth.uid()
    ));
```

---

## 🔐 **Row Level Security (RLS) Policies**

### Principiu Fundamental
```sql
-- Toate tabelele cu company_id trebuie să aibă această politică:
CREATE POLICY table_isolation_policy ON table_name
    FOR ALL
    USING (company_id = (
        SELECT company_id FROM users WHERE id = auth.uid()
    ));
```

### Politici Specifice

#### 1. **Super Admin Access**
```sql
-- Super admins pot vedea toate datele
CREATE POLICY super_admin_all_access ON projects
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role = 'super_admin'
        )
        OR
        company_id = (
            SELECT company_id FROM users WHERE id = auth.uid()
        )
    );
```

#### 2. **Read-Only pentru Anumite Roluri**
```sql
-- Operatives pot doar citi proiecte, nu pot modifica
CREATE POLICY operative_read_only ON projects
    FOR SELECT
    USING (
        company_id = (
            SELECT company_id FROM users WHERE id = auth.uid()
        )
    );

CREATE POLICY operative_no_write ON projects
    FOR INSERT, UPDATE, DELETE
    USING (
        (SELECT role FROM users WHERE id = auth.uid()) != 'operative'
        AND
        company_id = (
            SELECT company_id FROM users WHERE id = auth.uid()
        )
    );
```

---

## 🔄 **Logica în Aplicație**

### 1. **Autentificare și Identificare Tenant**

```typescript
// utils/tenantContext.ts
import { supabase } from './supabaseClient';
import { User } from './types';

export interface TenantContext {
    user: User;
    companyId: string;
    companyName: string;
    companyPlan: string;
    subscriptions: string[]; // Agent IDs
}

export const getTenantContext = async (): Promise<TenantContext | null> => {
    // 1. Get authenticated user
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !authUser) {
        return null;
    }

    // 2. Get user profile with company info
    const { data: userProfile, error: profileError } = await supabase
        .from('users')
        .select(`
            *,
            company:companies(*)
        `)
        .eq('id', authUser.id)
        .single();

    if (profileError || !userProfile) {
        return null;
    }

    // 3. Get active subscriptions
    const { data: subscriptions } = await supabase
        .from('subscriptions')
        .select('agent_id')
        .eq('company_id', userProfile.company_id)
        .eq('status', 'active');

    return {
        user: userProfile,
        companyId: userProfile.company_id,
        companyName: userProfile.company.name,
        companyPlan: userProfile.company.plan,
        subscriptions: subscriptions?.map(s => s.agent_id) || [],
    };
};
```

### 2. **API Calls cu Tenant Context**

```typescript
// api.ts - Updated
export const fetchProjects = async (tenantContext: TenantContext): Promise<Project[]> => {
    // RLS automatically filters by company_id
    const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
};

export const createProject = async (
    tenantContext: TenantContext,
    projectData: Partial<Project>
): Promise<Project> => {
    // Automatically inject company_id
    const { data, error } = await supabase
        .from('projects')
        .insert({
            ...projectData,
            company_id: tenantContext.companyId,
            created_by: tenantContext.user.id,
        })
        .select()
        .single();

    if (error) throw error;
    return data;
};
```

### 3. **React Context pentru Tenant**

```typescript
// contexts/TenantContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { TenantContext, getTenantContext } from '../utils/tenantContext';

const TenantContextProvider = createContext<TenantContext | null>(null);

export const TenantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [tenantContext, setTenantContext] = useState<TenantContext | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadTenantContext = async () => {
            const context = await getTenantContext();
            setTenantContext(context);
            setLoading(false);
        };

        loadTenantContext();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!tenantContext) {
        return <div>Please login</div>;
    }

    return (
        <TenantContextProvider.Provider value={tenantContext}>
            {children}
        </TenantContextProvider.Provider>
    );
};

export const useTenant = () => {
    const context = useContext(TenantContextProvider);
    if (!context) {
        throw new Error('useTenant must be used within TenantProvider');
    }
    return context;
};
```

---

## 🛡️ **Securitate Multi-Nivel**

### 1. **Database Level (RLS)**
- ✅ Row Level Security pe toate tabelele
- ✅ Politici stricte bazate pe company_id
- ✅ Imposibil de accesat date din alte companii

### 2. **Application Level**
- ✅ Tenant Context în toate API calls
- ✅ Validare company_id în backend
- ✅ Error handling pentru acces neautorizat

### 3. **API Level**
- ✅ Middleware pentru verificare tenant
- ✅ Rate limiting per tenant
- ✅ Audit logging

---

## 📊 **Piața de Agenți AI**

### Flow Complet

```typescript
// 1. Afișare agenți disponibili
export const getAvailableAgents = async (): Promise<Agent[]> => {
    const { data, error } = await supabase
        .from('agents')
        .select('*')
        .eq('is_active', true);

    if (error) throw error;
    return data || [];
};

// 2. Verificare abonamente active
export const getActiveSubscriptions = async (
    tenantContext: TenantContext
): Promise<Subscription[]> => {
    const { data, error } = await supabase
        .from('subscriptions')
        .select(`
            *,
            agent:agents(*)
        `)
        .eq('company_id', tenantContext.companyId)
        .eq('status', 'active');

    if (error) throw error;
    return data || [];
};

// 3. Activare agent
export const subscribeToAgent = async (
    tenantContext: TenantContext,
    agentId: string
): Promise<Subscription> => {
    const { data, error } = await supabase
        .from('subscriptions')
        .insert({
            company_id: tenantContext.companyId,
            agent_id: agentId,
            status: 'active',
            started_at: new Date().toISOString(),
        })
        .select()
        .single();

    if (error) throw error;
    return data;
};
```

---

## ✅ **Checklist Implementare**

### Database
- [ ] Create companies table
- [ ] Update users table with company_id
- [ ] Add company_id to all data tables
- [ ] Create agents table
- [ ] Create subscriptions table
- [ ] Enable RLS on all tables
- [ ] Create isolation policies
- [ ] Create indexes

### Application
- [ ] Implement TenantContext
- [ ] Update all API calls
- [ ] Add tenant validation
- [ ] Implement agent marketplace
- [ ] Add subscription management
- [ ] Update UI to show company info

### Security
- [ ] Test RLS policies
- [ ] Audit logging
- [ ] Rate limiting
- [ ] Error handling
- [ ] Access control testing

---

## 🚀 **Next Steps**

1. **Database Migration** - Create tables and policies
2. **Update API Layer** - Add tenant context
3. **Update UI** - Show company info
4. **Implement Marketplace** - Agent subscription flow
5. **Testing** - Multi-tenant isolation
6. **Documentation** - API docs and user guides

---

**🏢 ConstructAI este acum pregătit pentru arhitectura multi-tenant!** 🎉

