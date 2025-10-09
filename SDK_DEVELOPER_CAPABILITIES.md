# CortexBuild SDK Developer Capabilities & Integrations 🚀

## Overview
CortexBuild SDK oferă o platformă completă pentru developeri cu capabilități avansate de integrare, webhooks, sandbox testing, și marketplace.

---

## 📊 Database Architecture

### New Tables Added

#### 1. **API Keys** (`api_keys`)
Management pentru API keys SDK developers
```sql
- id: Identificator unic
- user_id: User owner
- name: Nume descriptiv pentru key
- key_hash: Hash securizat al key-ului
- key_prefix: Prefix vizibil (primele caractere)
- scopes: Permisiuni (JSON array)
- is_active: Status activ/inactiv
- last_used_at: Ultima folosire
- expires_at: Data expirării
```

#### 2. **Webhooks** (`webhooks`)
Real-time event notifications
```sql
- id: Identificator
- user_id: Developer owner
- company_id: Companie asociată
- name: Nume webhook
- url: URL destinație
- events: Evenimente subscrise (JSON)
- secret: Secret pentru semnătura HMAC
- is_active: Status
- success_count: Deliveries reușite
- failure_count: Deliveries eșuate
- last_triggered_at: Ultimul trigger
```

#### 3. **Integrations** (`integrations`)
Third-party integrations (QuickBooks, Slack, etc.)
```sql
- id: Identificator
- user_id: User owner
- company_id: Companie
- provider: Provider (quickbooks, slack, google_drive, etc.)
- name: Nume integrare
- credentials: Credențiale criptate
- config: Configurare JSON
- is_active: Status
- last_sync_at: Ultima sincronizare
- sync_status: Status sync (idle/syncing/success/error)
```

#### 4. **OAuth Tokens** (`oauth_tokens`)
OAuth tokens pentru integrări
```sql
- integration_id: Referință integrare
- access_token: Token acces (criptat)
- refresh_token: Token refresh (criptat)
- token_type: Tip (Bearer, etc.)
- expires_at: Expirare
- scope: Permisiuni OAuth
```

#### 5. **Webhook Logs** (`webhook_logs`)
Istoric deliveries webhooks
```sql
- webhook_id: Referință webhook
- event_type: Tip eveniment
- payload: Date trimise
- response_status: HTTP status code
- response_body: Răspuns primit
- error_message: Mesaj eroare (dacă există)
- delivered_at: Timestamp
```

#### 6. **Sandbox Environments** (`sandbox_environments`)
Medii de testare izolate
```sql
- id: Identificator
- user_id: Developer owner
- name: Nume sandbox
- description: Descriere
- config: Configurare (JSON)
- is_active: Status
```

#### 7. **Module Reviews** (`module_reviews`)
Review-uri marketplace
```sql
- module_id: Modul
- user_id: Reviewer
- rating: Rating 1-5
- review: Text review
```

---

## 🔌 Integrations Service

### Supported Providers

#### 1. **QuickBooks** 📊
Integration with QuickBooks Online for accounting

**Features:**
- ✅ Sync invoices bidirectional
- ✅ Sync clients/customers
- ✅ Auto-create invoices în QuickBooks
- ✅ Real-time payment updates
- ✅ Expense tracking

**Setup:**
```typescript
import { createIntegration, QuickBooksIntegration } from './services/integrations';

// Create integration
const integration = createIntegration(
  db,
  userId,
  companyId,
  'quickbooks',
  'My QuickBooks Integration',
  {
    realmId: 'your-realm-id',
    companyName: 'My Company'
  }
);

// Use integration
const qb = new QuickBooksIntegration(db, integration.id);
await qb.syncInvoices();
await qb.syncClients();
```

#### 2. **Slack** 💬
Real-time notifications și collaboration

**Features:**
- ✅ Send messages to channels
- ✅ Project status notifications
- ✅ RFI alerts
- ✅ Invoice notifications
- ✅ Task reminders

**Setup:**
```typescript
const slack = new SlackIntegration(db, integrationId);

// Send message
await slack.sendMessage('#general', 'Hello from CortexBuild!');

// Automatic notifications
await slack.notifyProjectUpdate('New Office Building', 'In Progress');
await slack.notifyRFI('RFI-001', 'Foundation specifications clarification');
```

#### 3. **Google Drive** 📁
Document storage și sync

**Features:**
- ✅ Upload documents
- ✅ Sync project folders
- ✅ Auto-backup
- ✅ Version control
- ✅ Shared access

**Setup:**
```typescript
const drive = new GoogleDriveIntegration(db, integrationId);

// Upload document
const fileId = await drive.uploadDocument(
  'Blueprint_v2.pdf',
  fileBuffer,
  folderId
);

// Sync all documents
await drive.syncDocuments();
```

#### 4. **Other Supported Providers:**
- ✅ **Dropbox** - File storage
- ✅ **Xero** - Accounting alternative
- ✅ **Stripe** - Payment processing
- ✅ **Mailchimp** - Email marketing
- ✅ **Zapier** - Workflow automation
- ✅ **GitHub** - Code repository integration
- ✅ **Jira** - Project management

---

## 🪝 Webhooks System

### Available Webhook Events

#### Project Events
```
- project.created
- project.updated
- project.deleted
- project.status_changed
```

#### Task Events
```
- task.created
- task.updated
- task.deleted
- task.completed
```

#### RFI Events
```
- rfi.created
- rfi.answered
- rfi.closed
```

#### Invoice Events
```
- invoice.created
- invoice.sent
- invoice.paid
- invoice.overdue
```

#### Client Events
```
- client.created
- client.updated
```

#### Document Events
```
- document.uploaded
- document.shared
```

#### Time Tracking Events
```
- time_entry.created
- time_entry.approved
```

#### Purchase Order Events
```
- purchase_order.created
- purchase_order.approved
- purchase_order.received
```

### Creating a Webhook

```typescript
import { createWebhook } from './services/webhooks';

const webhook = createWebhook(
  db,
  userId,
  companyId,
  'My Webhook',
  'https://myapp.com/webhooks/cortexbuild',
  ['project.created', 'invoice.paid', 'task.completed']
);

console.log('Webhook secret:', webhook.secret);
```

### Webhook Payload Format

```json
{
  "event": "project.created",
  "timestamp": 1709876543210,
  "data": {
    "project": {
      "id": 123,
      "name": "New Office Building",
      "status": "active",
      "budget": 5000000,
      "client_id": 45
    }
  },
  "company_id": "company-1",
  "user_id": "user-1"
}
```

### Webhook Headers

```
X-CortexBuild-Event: project.created
X-CortexBuild-Signature: sha256_hmac_signature
X-CortexBuild-Timestamp: 1709876543210
X-CortexBuild-Webhook-Id: 123
```

### Verifying Webhook Signature

```typescript
import crypto from 'crypto';

function verifyWebhook(payload: string, signature: string, secret: string): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}
```

### Webhook Security Features

1. **HMAC Signatures** - Verify authenticity
2. **Auto-disable** - După 10 consecutive failures
3. **Delivery logs** - Track all attempts
4. **Retry mechanism** - Manual retry failed deliveries
5. **Rate limiting** - Prevent abuse
6. **Timeout protection** - 10 second timeout

---

## 🔐 API Endpoints

### Integration Endpoints

```bash
# Get all integrations
GET /api/integrations/list

# Get specific integration
GET /api/integrations/:id

# Create integration
POST /api/integrations
{
  "provider": "quickbooks",
  "name": "My QuickBooks",
  "credentials": {...},
  "config": {...}
}

# Update integration status
PATCH /api/integrations/:id/status
{
  "is_active": true
}

# Sync integration
POST /api/integrations/:id/sync

# Delete integration
DELETE /api/integrations/:id

# Get available providers
GET /api/integrations/providers/available
```

### Webhook Endpoints

```bash
# Get all webhooks
GET /api/integrations/webhooks/list

# Get specific webhook
GET /api/integrations/webhooks/:id

# Create webhook
POST /api/integrations/webhooks
{
  "name": "My Webhook",
  "url": "https://myapp.com/webhook",
  "events": ["project.created", "invoice.paid"]
}

# Update webhook
PATCH /api/integrations/webhooks/:id
{
  "name": "Updated Name",
  "is_active": false
}

# Test webhook
POST /api/integrations/webhooks/:id/test

# Get webhook logs
GET /api/integrations/webhooks/:id/logs?limit=50

# Delete webhook
DELETE /api/integrations/webhooks/:id

# Get available events
GET /api/integrations/webhooks/events/available
```

---

## 🧪 Sandbox Environment

### Features

- ✅ **Isolated testing** - Nu afectează production data
- ✅ **Sample data** - Pre-populated cu date test
- ✅ **Reset capability** - Reset la stare inițială
- ✅ **API testing** - Test toate API-urile
- ✅ **Webhook testing** - Test delivery webhooks
- ✅ **Integration testing** - Test integrări fără risk

### Creating a Sandbox

```typescript
const sandbox = db.prepare(`
  INSERT INTO sandbox_environments (user_id, name, description, config, is_active)
  VALUES (?, ?, ?, ?, 1)
`).run(
  userId,
  'Development Sandbox',
  'For testing new features',
  JSON.stringify({
    sampleDataEnabled: true,
    webhooksEnabled: true,
    integrationsEnabled: false
  })
);
```

---

## 📈 Usage Tracking

### AI Requests Tracking
```sql
SELECT
  DATE(created_at) as date,
  COUNT(*) as requests,
  SUM(total_tokens) as tokens,
  SUM(estimated_cost) as cost
FROM ai_requests
WHERE user_id = ?
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

### Integration Usage
```sql
SELECT
  provider,
  COUNT(*) as syncs,
  MAX(last_sync_at) as last_sync,
  AVG(CASE WHEN sync_status = 'success' THEN 1 ELSE 0 END) as success_rate
FROM integrations
WHERE company_id = ?
GROUP BY provider;
```

### Webhook Delivery Stats
```sql
SELECT
  name,
  success_count,
  failure_count,
  ROUND(success_count * 100.0 / (success_count + failure_count), 2) as success_rate
FROM webhooks
WHERE user_id = ?
ORDER BY (success_count + failure_count) DESC;
```

---

## 🎯 SDK Developer Tiers

### Free Tier
- ✅ 10 AI requests/month
- ✅ 3 integrări active
- ✅ 5 webhooks
- ✅ 1 sandbox environment
- ✅ Community support

### Starter Tier ($29/month)
- ✅ 100 AI requests/month
- ✅ 10 integrări active
- ✅ 20 webhooks
- ✅ 3 sandbox environments
- ✅ Email support
- ✅ Marketplace access

### Pro Tier ($99/month)
- ✅ 1,000 AI requests/month
- ✅ Unlimited integrations
- ✅ Unlimited webhooks
- ✅ 10 sandbox environments
- ✅ Priority support
- ✅ 70% revenue share
- ✅ Advanced analytics

### Enterprise Tier (Custom)
- ✅ Unlimited everything
- ✅ Dedicated support
- ✅ SLA guarantee
- ✅ Custom integrations
- ✅ White-label options
- ✅ On-premise deployment

---

## 🛡️ Security Features

### 1. **Credential Encryption**
- AES-256-CBC encryption
- Separate encryption keys per environment
- Automatic key rotation support

### 2. **OAuth 2.0**
- Secure token storage
- Automatic token refresh
- Scope-based permissions

### 3. **Webhook Security**
- HMAC-SHA256 signatures
- Timestamp validation
- IP whitelisting (optional)

### 4. **API Key Management**
- Scoped permissions
- Expiration dates
- Usage tracking
- Instant revocation

### 5. **Rate Limiting**
- Per-user limits
- Per-endpoint limits
- Automatic blocking

---

## 📚 Example Use Cases

### 1. **Automated Invoice Sync**
```typescript
// Automatic sync when invoice is created
async function onInvoiceCreated(invoice: Invoice) {
  const integrations = getCompanyIntegrations(db, invoice.company_id);
  const qb = integrations.find(i => i.provider === 'quickbooks');

  if (qb && qb.is_active) {
    const qbClient = new QuickBooksIntegration(db, qb.id);
    await qbClient.createInvoice(invoice);
  }

  // Trigger webhooks
  await triggerWebhooksForEvent(
    db,
    invoice.company_id,
    'invoice.created',
    { invoice }
  );
}
```

### 2. **Slack Notifications for RFIs**
```typescript
async function onRFICreated(rfi: RFI) {
  const slack = await getSlackIntegration(db, rfi.project.company_id);

  if (slack) {
    await slack.notifyRFI(rfi.rfi_number, rfi.subject);
  }
}
```

### 3. **Document Auto-Backup**
```typescript
async function onDocumentUploaded(document: Document) {
  const drive = await getGoogleDriveIntegration(db, document.company_id);

  if (drive) {
    await drive.uploadDocument(
      document.name,
      document.file_data,
      document.project_folder_id
    );
  }
}
```

---

## 🚀 Getting Started

### Step 1: Enable SDK Developer Mode
```bash
# In .env.local
ENABLE_SDK_DEVELOPER=true
```

### Step 2: Create Integration
```bash
curl -X POST http://localhost:3001/api/integrations \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "slack",
    "name": "Team Slack",
    "credentials": {
      "accessToken": "xoxb-your-token",
      "defaultChannel": "#general"
    }
  }'
```

### Step 3: Create Webhook
```bash
curl -X POST http://localhost:3001/api/integrations/webhooks \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Project Updates",
    "url": "https://myapp.com/webhook",
    "events": ["project.created", "project.updated"]
  }'
```

### Step 4: Test Integration
```bash
curl -X POST http://localhost:3001/api/integrations/1/sync \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📞 Support

- **Email**: adrian.stanca1@gmail.com
- **Documentation**: /docs/sdk
- **API Reference**: /docs/api
- **Community**: Discord/Slack

---

**Status**: ✅ Production Ready
**Version**: 2.0.0
**Last Updated**: 2025-10-09
