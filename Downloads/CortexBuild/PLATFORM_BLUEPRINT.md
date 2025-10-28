# 🚀 CortexBuild Platform - Complete Blueprint

**Version**: 3.0.0 - Multi-Tenant SaaS with UK Tender Assistant
**Date**: 13 October 2025
**Status**: Integration Phase

---

## 🎯 Platform Vision

CortexBuild este o platformă SaaS multi-tenant care combină:
1. **Construction Management** - Gestionare proiecte de construcții
2. **UK Tender Assistant** - Asistent AI pentru licitații UK (Procurement Act 2023)
3. **SDK Developer Platform** - Marketplace de module și integrări
4. **AI Agents** - Agenți AI personalizabili pentru automatizare

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    CortexBuild Platform                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌───────────────┐  ┌──────────────┐  ┌────────────────┐  │
│  │  Super Admin  │  │   Company    │  │   UK Tender    │  │
│  │   Dashboard   │  │  Dashboards  │  │   Assistant    │  │
│  └───────────────┘  └──────────────┘  └────────────────┘  │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │         Multi-Tenant Management Layer                 │ │
│  │  - Company isolation                                  │ │
│  │  - User invitations                                   │ │
│  │  - Role-based access (RBAC)                          │ │
│  │  - Subscription management                           │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │              AI & Automation Layer                    │ │
│  │  - AI Agents (code gen, data analysis, automation)   │ │
│  │  - UK Tender AI (bid generation, compliance)         │ │
│  │  - ML Predictor (cost estimation, trends)            │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │               Integration Layer                       │ │
│  │  - 12 pre-configured services                        │ │
│  │  - Contracts Finder API                              │ │
│  │  - Stripe/LemonSqueezy billing                       │ │
│  │  - Webhooks & OAuth                                  │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │                 Data Layer                            │ │
│  │  - PostgreSQL (production)                           │ │
│  │  - SQLite (development)                              │ │
│  │  - Redis (caching)                                   │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 👥 User Roles & Permissions

### 1. Super Admin (Platform Owner)
**Access**: Full platform control

**Capabilities**:
- ✅ Create/delete companies
- ✅ Manage all users
- ✅ Configure subscription plans
- ✅ View system analytics
- ✅ Access all company data
- ✅ Configure feature flags
- ✅ Manage API keys
- ✅ System health monitoring

### 2. Company Admin
**Access**: Company-level control

**Capabilities**:
- ✅ Invite users to company
- ✅ Manage company projects
- ✅ View financial reports
- ✅ Configure company settings
- ✅ Access UK Tender Assistant
- ✅ Manage team members
- ❌ Access other companies
- ❌ Platform settings

### 3. Company User (Project Manager)
**Access**: Project-level

**Capabilities**:
- ✅ Manage assigned projects
- ✅ Create/edit tasks
- ✅ Use UK Tender Assistant
- ✅ Collaborate with team
- ✅ View project reports
- ❌ Company settings
- ❌ Financial data
- ❌ User management

### 4. SDK Developer
**Access**: Developer tools

**Capabilities**:
- ✅ Create AI Agents
- ✅ Build workflow automations
- ✅ Access API documentation
- ✅ Manage API keys
- ✅ Publish to marketplace
- ❌ Company operations
- ❌ Platform admin

---

## 🔐 Multi-Tenant System

### Company Isolation

```typescript
// Database Schema
interface Company {
  id: string;
  name: string;
  slug: string; // Unique: 'as-cladding-ltd'
  subscription: {
    plan: 'free' | 'starter' | 'pro' | 'enterprise';
    status: 'active' | 'trialing' | 'past_due' | 'canceled';
    stripeCustomerId: string;
    currentPeriodEnd: Date;
  };
  settings: {
    maxUsers: number;
    features: string[];
    tenderAlerts: boolean;
    aiCredits: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

interface User {
  id: string;
  email: string;
  name: string;
  role: 'super_admin' | 'company_admin' | 'project_manager' | 'developer';
  companyId: string; // FK to Company
  invitedBy: string; // User ID
  invitationToken?: string;
  invitationAccepted: boolean;
  avatar?: string;
  createdAt: Date;
}
```

### Invitation Flow

```
1. Company Admin → Sends invitation
   ↓
2. System generates secure token
   ↓
3. Email sent to invitee with link
   ↓
4. User clicks link → /invite/accept?token=xxx
   ↓
5. User sets password and completes profile
   ↓
6. User assigned to company
   ↓
7. Welcome email + onboarding
```

**Implementation**:
```typescript
// POST /api/invitations
{
  email: 'user@example.com',
  role: 'project_manager',
  companyId: 'company-xxx'
}

// Response
{
  success: true,
  invitationId: 'inv-xxx',
  expiresAt: '2025-10-20T00:00:00Z'
}
```

---

## 🇬🇧 UK Tender Assistant Module

### Core Features

#### 1. Tender Search & Alerts
**Sources**:
- Contracts Finder
- Find a Tender
- Public Contracts Scotland
- Sell2Wales
- GOV.UK notices

**Filters**:
- Keywords (e.g., "cladding")
- Location (postcode, region)
- Value range
- Contract type (main/sub)
- Procurement Act compliance

**Alerts**:
- Real-time email notifications
- In-app notifications
- SMS alerts (premium)

#### 2. AI Bid Generator
**Powered by**: OpenAI GPT-4

**Features**:
- Generate compliant bids
- Procurement Act 2023 templates
- Social value scoring
- Sustainability integration
- Version control
- Export PDF/DOCX

**Example**:
```javascript
// POST /api/tenders/generate-bid
{
  tenderId: 'tender-123',
  companyProfile: {
    name: 'AS Cladding Ltd',
    expertise: ['cladding', 'roofing'],
    certifications: ['ISO 9001'],
    pastProjects: [...]
  },
  tenderRequirements: {
    title: 'Hospital Cladding Project',
    value: 250000,
    deadline: '2025-11-15'
  }
}

// Response: AI-generated bid
{
  content: 'Dear Procurement Team...',
  complianceScore: 95,
  suggestions: [
    'Add more social value examples',
    'Include sustainability metrics'
  ]
}
```

#### 3. Compliance Checker
**Checks**:
- ✅ 30-day payment terms
- ✅ Social value (10% minimum)
- ✅ Transparency requirements
- ✅ SME-friendly language
- ✅ Sustainability targets

**Output**:
```json
{
  overall: 92,
  checks: [
    {
      rule: '30-day payment',
      passed: true,
      confidence: 100
    },
    {
      rule: 'Social value',
      passed: true,
      score: 85,
      suggestions: ['Add community training']
    }
  ]
}
```

#### 4. Cost Estimator
**Real-time pricing** from:
- BCIS (Building Cost Information Service)
- Historical project data
- Material suppliers
- Labor rate databases

**Calculate**:
- Material costs
- Labor costs
- Equipment hire
- Overheads
- Profit margin
- VAT

#### 5. Collaboration Hub
**Features**:
- Partner search (cladding firms, suppliers)
- Joint bid creation
- WebSocket real-time chat
- Document sharing
- Contract management

#### 6. Market Intelligence
**AI Analysis**:
- Tender trends (location, value, type)
- Competitor activity
- Win rate by region
- Pricing benchmarks
- Success factors

---

## 💳 Subscription Plans

### Free Plan
- 1 company
- 3 users
- 5 projects
- Basic tender search
- 10 AI bid generations/month
- Community support

### Starter Plan - £49/month
- 1 company
- 10 users
- 25 projects
- Advanced tender search
- 50 AI bid generations/month
- Email alerts
- Compliance checker
- Email support

### Pro Plan - £149/month
- 1 company
- Unlimited users
- Unlimited projects
- Priority tender alerts
- 500 AI bid generations/month
- Cost estimator
- Collaboration hub
- Market intelligence
- Priority support

### Enterprise Plan - Custom
- Multiple companies
- Unlimited everything
- Custom AI training
- Dedicated account manager
- White-label option
- API access
- SLA guarantee
- 24/7 support

---

## 🛠️ Technical Implementation

### Frontend Stack
```
- Framework: React 19 + TypeScript
- Styling: Tailwind CSS
- State: React Context + Hooks
- Charts: Chart.js
- Real-time: WebSocket
- Forms: React Hook Form
- Routing: Custom navigation
```

### Backend Stack
```
- Runtime: Node.js 20
- Framework: Express.js
- Database: PostgreSQL (prod) / SQLite (dev)
- ORM: Prisma (future) / Better-SQLite3 (current)
- Cache: Redis
- Queue: Bull (for background jobs)
- Auth: JWT
```

### AI/ML Services
```
- OpenAI GPT-4: Bid generation, chat
- Google Gemini: Alternative AI
- Custom ML: Cost prediction, trend analysis
```

### External APIs
```
- Contracts Finder API
- Find a Tender API
- Stripe: Billing
- SendGrid: Email
- Twilio: SMS (optional)
```

---

## 📊 Database Schema Updates

### New Tables for Tender Assistant

```sql
-- Tenders
CREATE TABLE tenders (
  id TEXT PRIMARY KEY,
  source TEXT NOT NULL, -- 'contracts-finder', 'find-tender', etc.
  external_id TEXT UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  value REAL,
  currency TEXT DEFAULT 'GBP',
  contract_type TEXT, -- 'main-contractor', 'subcontractor'
  location TEXT,
  postcode TEXT,
  deadline DATETIME,
  published_date DATETIME,
  procurement_act_compliant BOOLEAN DEFAULT true,
  keywords TEXT, -- JSON array
  documents TEXT, -- JSON array of URLs
  contact_email TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tender Alerts
CREATE TABLE tender_alerts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT REFERENCES users(id),
  company_id TEXT REFERENCES companies(id),
  keywords TEXT, -- JSON array
  location TEXT,
  min_value REAL,
  max_value REAL,
  contract_types TEXT, -- JSON array
  frequency TEXT DEFAULT 'instant', -- 'instant', 'daily', 'weekly'
  active BOOLEAN DEFAULT true,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Generated Bids
CREATE TABLE generated_bids (
  id TEXT PRIMARY KEY,
  tender_id TEXT REFERENCES tenders(id),
  company_id TEXT REFERENCES companies(id),
  user_id TEXT REFERENCES users(id),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  compliance_score INTEGER,
  compliance_checks TEXT, -- JSON
  version INTEGER DEFAULT 1,
  status TEXT DEFAULT 'draft', -- 'draft', 'reviewed', 'submitted', 'won', 'lost'
  submitted_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Cost Estimates
CREATE TABLE cost_estimates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tender_id TEXT REFERENCES tenders(id),
  company_id TEXT REFERENCES companies(id),
  materials REAL,
  labor REAL,
  equipment REAL,
  overheads REAL,
  profit_margin REAL,
  vat REAL,
  total REAL,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Invitations
CREATE TABLE invitations (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  company_id TEXT REFERENCES companies(id),
  role TEXT NOT NULL,
  invited_by TEXT REFERENCES users(id),
  token TEXT UNIQUE NOT NULL,
  accepted BOOLEAN DEFAULT false,
  expires_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Subscriptions
CREATE TABLE subscriptions (
  id TEXT PRIMARY KEY,
  company_id TEXT UNIQUE REFERENCES companies(id),
  plan TEXT NOT NULL, -- 'free', 'starter', 'pro', 'enterprise'
  status TEXT DEFAULT 'active',
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  current_period_start DATETIME,
  current_period_end DATETIME,
  cancel_at_period_end BOOLEAN DEFAULT false,
  trial_end DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🎨 UI/UX Design

### Super Admin Dashboard
```
┌─────────────────────────────────────────────────────┐
│  CortexBuild - Super Admin                          │
├─────────────────────────────────────────────────────┤
│                                                     │
│  📊 Platform Overview                               │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐             │
│  │ 234  │ │ 1.2K │ │ 95%  │ │ £45K │             │
│  │ Cos  │ │Users │ │Uptime│ │ MRR  │             │
│  └──────┘ └──────┘ └──────┘ └──────┘             │
│                                                     │
│  🏢 Companies                                       │
│  ┌────────────────────────────────────────┐       │
│  │ AS Cladding Ltd  | Pro    | 15 users  │       │
│  │ BuildEasy Co     | Starter| 5 users   │       │
│  │ GreenRoof        | Free   | 2 users   │       │
│  └────────────────────────────────────────┘       │
│                                                     │
│  👥 Recent Users    📈 Revenue Trends              │
│  🔔 System Alerts   🎯 Top Performing Companies   │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### UK Tender Assistant
```
┌─────────────────────────────────────────────────────┐
│  🇬🇧 UK Tender Assistant                            │
├─────────────────────────────────────────────────────┤
│                                                     │
│  🔍 Search Tenders                                  │
│  [cladding_____________] [Birmingham___] [Search]  │
│                                                     │
│  🔔 Active Alerts: 3                                │
│  └─ New tenders matching your criteria            │
│                                                     │
│  📋 Recent Tenders                                  │
│  ┌────────────────────────────────────────┐       │
│  │ Hospital Cladding Project              │       │
│  │ £250,000 | Birmingham | Deadline: 15d │       │
│  │ [Generate Bid] [Save] [Set Alert]     │       │
│  ├────────────────────────────────────────┤       │
│  │ School Roofing Upgrade                 │       │
│  │ £180,000 | Manchester | Deadline: 22d │       │
│  │ [Generate Bid] [Save] [Set Alert]     │       │
│  └────────────────────────────────────────┘       │
│                                                     │
│  🤖 AI Assistant: "I found 2 high-value tenders    │
│      matching your profile!"                       │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## 🚀 Implementation Roadmap

### Phase 1: Multi-Tenant Foundation (Week 1)
- [x] Database schema updates
- [ ] Invitation system
- [ ] Company isolation middleware
- [ ] RBAC implementation
- [ ] Subscription model

### Phase 2: UK Tender Assistant (Week 2-3)
- [ ] Contracts Finder API integration
- [ ] Tender search & filtering
- [ ] AI bid generator
- [ ] Compliance checker
- [ ] Cost estimator

### Phase 3: Billing Integration (Week 3-4)
- [ ] Stripe setup
- [ ] Subscription plans
- [ ] Payment webhooks
- [ ] Usage tracking
- [ ] Invoice generation

### Phase 4: Enhanced Features (Week 4-5)
- [ ] Collaboration hub
- [ ] Market intelligence
- [ ] Advanced analytics
- [ ] Mobile optimization
- [ ] Performance tuning

### Phase 5: Testing & Deployment (Week 5-6)
- [ ] End-to-end testing
- [ ] Security audit
- [ ] Load testing
- [ ] Documentation
- [ ] Production deployment

---

## 📈 Success Metrics

### Platform KPIs
- Monthly Recurring Revenue (MRR)
- Customer Acquisition Cost (CAC)
- Churn Rate
- Active Users
- API Usage
- Support Tickets

### Tender Assistant KPIs
- Tenders searched
- Bids generated
- Compliance scores
- Win rate
- Time saved
- Cost savings

---

## 🎯 Go-to-Market Strategy

### Target Customers
1. **Small UK Construction Firms** (1-20 employees)
   - Cladding specialists
   - Roofing companies
   - General contractors

2. **Medium Construction Companies** (20-50 employees)
   - Multi-service providers
   - Regional contractors

### Pricing Strategy
- Free tier: Market entry
- Starter: £49/mo (sweet spot for SMEs)
- Pro: £149/mo (growing companies)
- Enterprise: Custom (large firms, white-label)

### Marketing Channels
- Google Ads (keywords: "uk tenders", "procurement act")
- LinkedIn (construction professionals)
- Trade shows (UK Construction Week)
- Content marketing (blog, case studies)
- Partnerships (trade associations)

---

## 📞 Next Steps

To continue development, we need:

1. **Confirm**: Are we proceeding with this integrated platform?
2. **Prioritize**: Which feature to implement first?
   - Multi-tenant invitations
   - UK Tender Assistant
   - Billing system
3. **API Keys**:
   - Contracts Finder API
   - Stripe keys
   - OpenAI API (already have)

**Ready to build?** 🚀

---

**Document Version**: 1.0
**Last Updated**: 2025-10-13
**Author**: CortexBuild Team
