# CortexBuild Developer Platform - Subscription & Pricing Model

## 🎯 Mission & Vision

### Mission

**Democratize construction automation** by providing enterprise-grade AI, workflow automation, and procurement management tools accessible to developers, contractors, and construction technology innovators.

### Vision

**The Neural Cortex for Construction** - A central intelligence platform that connects every stakeholder, automates every workflow, and predicts every outcome in the construction lifecycle.

---

## 🧠 Neural Cortex Architecture

### Core Intelligence Layers

```
┌────────────────────────────────────────────────────────────────┐
│                    CORTEXBUILD NEURAL CORTEX                    │
├────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Layer 1: Data Ingestion                                        │
│  ├─ Multi-tenant data streams (RLS: tenant_id)                 │
│  ├─ Real-time event processing (WebSocket)                     │
│  └─ Document & image embeddings (pgvector + OpenAI)            │
│                                                                  │
│  Layer 2: Processing & Intelligence                             │
│  ├─ AI Analysis (GPT-4, Gemini, Claude)                        │
│  ├─ Workflow Orchestration (Flow Engine)                       │
│  ├─ Procurement Logic (3-bid enforcement, scoring)             │
│  └─ Predictive Analytics (Risk, Budget, Timeline)              │
│                                                                  │
│  Layer 3: Action & Integration                                  │
│  ├─ Automated Workflows (Triggers → Actions)                   │
│  ├─ Third-party Connectors (QuickBooks, Slack, Procore)        │
│  ├─ Mobile App Generator (PWA engine)                          │
│  └─ Agent Marketplace (Installable automation modules)         │
│                                                                  │
│  Layer 4: Security & Governance                                 │
│  ├─ Vault-backed secrets (connector-scoped, role-gated)        │
│  ├─ Row-level security (RLS with tenant_id propagation)        │
│  ├─ Audit logging (who, what, when, tenant context)            │
│  └─ RBAC permissions (role-based + custom policies)            │
│                                                                  │
└────────────────────────────────────────────────────────────────┘
```

---

## 💰 Subscription Tiers

### 1. Developer Platform Subscriptions

#### Free Tier - "Builder"

**Price**: $0/month  
**Target**: Hobbyists, students, proof-of-concepts

**Limits**:

- 3 automation flows
- 10 flow runs per month
- 1 sandbox environment
- 50 AI Assistant queries/month
- 1 mobile app (published)
- Basic connectors (webhooks only)
- Community support

**Features**:
✅ Universal AI Assistant (limited)  
✅ No-code Flow Builder (3 flows)  
✅ Procurement basics (view only)  
✅ 1 Mobile app builder project  
❌ No marketplace publishing  
❌ No advanced analytics  
❌ No premium connectors  

---

#### Pro Tier - "Innovator"

**Price**: $49/month (or $470/year - save 20%)  
**Target**: Professional developers, small agencies

**Limits**:

- **50 automation flows**
- **5,000 flow runs per month**
- **5 sandbox environments**
- **500 AI Assistant queries/month**
- **10 mobile apps** (published)
- **All connectors** (QuickBooks, Slack, Procore, etc.)
- **Priority support** (24h response)

**Features**:
✅ All Free tier features  
✅ Advanced AI Assistant with function calling  
✅ Full procurement automation (RFQ/Bid/PO)  
✅ Marketplace publishing (share apps)  
✅ Version control & rollback  
✅ Advanced analytics & insights  
✅ Custom branding for mobile apps  
✅ API key management (10 keys)  
✅ Webhook management (20 webhooks)  
✅ Team collaboration (up to 3 members)  

---

#### Enterprise Tier - "Architect"

**Price**: $199/month (or $1,910/year - save 20%)  
**Target**: Large agencies, construction tech companies

**Limits**:

- **Unlimited automation flows**
- **50,000 flow runs per month**
- **Unlimited sandbox environments**
- **5,000 AI Assistant queries/month**
- **Unlimited mobile apps**
- **All connectors + custom integrations**
- **Dedicated support** (4h response, Slack channel)

**Features**:
✅ All Pro tier features  
✅ White-label platform option  
✅ Custom AI models (fine-tuned)  
✅ Advanced security (SSO, SAML)  
✅ Dedicated infrastructure  
✅ SLA guarantees (99.9% uptime)  
✅ Unlimited team members  
✅ Custom connector development  
✅ Priority feature requests  
✅ Quarterly business reviews  

---

### 2. SDK App Subscriptions (Marketplace)

When developers publish apps to the marketplace, they can choose monetization:

#### Free Apps

- No commission from CortexBuild
- Developer gets 100% of any donations
- Featured in "Community Apps" section

#### Paid Apps

- Developer sets price ($1-$999 one-time or $1-$99/month)
- **CortexBuild takes 30% commission** (industry standard)
- Developer gets 70% of revenue
- Automatic payment processing
- Subscription management handled by platform

#### Premium Apps (Verified)

- Must pass security audit
- Featured in "Premium Apps" section
- Developer badge & profile
- **CortexBuild takes 20% commission** (reduced)
- Developer gets 80% of revenue
- Priority support for users
- Marketing support from CortexBuild

---

## 🏗️ Developer Environment & Marketplace Logic

### Tenant Propagation (RLS)

**Every query filters by `tenant_id`**:

```typescript
// Automatic tenant context injection
const getTenantContext = (req: Request): string => {
  return req.user.companyId; // From JWT token
};

// All database queries automatically filtered
export const getFlows = (tenantId: string) => {
  return db.prepare(`
    SELECT * FROM automation_flows 
    WHERE tenant_id = ?
    ORDER BY created_at DESC
  `).all(tenantId);
};

// Multi-tenant webhook delivery
export const dispatchWebhook = async (webhook: Webhook, event: any) => {
  // Webhook secret is tenant-scoped
  const secret = await getVaultSecret(webhook.tenant_id, webhook.secret_key);
  
  const signature = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(event))
    .digest('hex');
  
  await axios.post(webhook.url, event, {
    headers: {
      'X-Tenant-ID': webhook.tenant_id,
      'X-Signature': signature
    }
  });
};
```

---

### Secrets Management (Vault-Backed)

**Architecture**:

```
┌─────────────────────────────────────────────────────┐
│                  Secrets Vault                       │
├─────────────────────────────────────────────────────┤
│                                                       │
│  Tenant: company-1                                   │
│  ├─ Connector: quickbooks                           │
│  │  ├─ oauth_token (encrypted)                      │
│  │  ├─ oauth_refresh (encrypted)                    │
│  │  └─ expires_at                                   │
│  ├─ Connector: slack                                │
│  │  ├─ webhook_url (encrypted)                      │
│  │  └─ bot_token (encrypted)                        │
│  └─ API Keys                                         │
│     ├─ key_1 (hashed, never stored plain)           │
│     └─ key_2 (hashed)                               │
│                                                       │
│  Tenant: company-2                                   │
│  └─ ... (complete isolation)                        │
│                                                       │
└─────────────────────────────────────────────────────┘
```

**Implementation**:

```typescript
// server/services/vault.ts
import bcrypt from 'bcrypt';
import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.VAULT_ENCRYPTION_KEY!; // 32 bytes

export class VaultService {
  private encrypt(text: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
  }

  private decrypt(text: string): string {
    const parts = text.split(':');
    const iv = Buffer.from(parts.shift()!, 'hex');
    const encryptedText = Buffer.from(parts.join(':'), 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  }

  // Store connector secret (tenant-scoped, role-gated)
  async storeSecret(
    tenantId: string, 
    connectorId: string, 
    key: string, 
    value: string,
    requiredRole: string[]
  ): Promise<void> {
    const encrypted = this.encrypt(value);
    
    db.prepare(`
      INSERT INTO vault_secrets (tenant_id, connector_id, key, value, required_roles)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT (tenant_id, connector_id, key) 
      DO UPDATE SET value = ?, updated_at = CURRENT_TIMESTAMP
    `).run(tenantId, connectorId, key, encrypted, JSON.stringify(requiredRole), encrypted);
  }

  // Retrieve secret (with role check)
  async getSecret(
    tenantId: string, 
    connectorId: string, 
    key: string,
    userRole: string
  ): Promise<string | null> {
    const row: any = db.prepare(`
      SELECT value, required_roles 
      FROM vault_secrets 
      WHERE tenant_id = ? AND connector_id = ? AND key = ?
    `).get(tenantId, connectorId, key);

    if (!row) return null;

    // Check role authorization
    const requiredRoles = JSON.parse(row.required_roles);
    if (!requiredRoles.includes(userRole) && userRole !== 'super_admin') {
      throw new Error('Insufficient permissions to access this secret');
    }

    return this.decrypt(row.value);
  }

  // API Key generation and storage (never stored plain text)
  async generateApiKey(tenantId: string, userId: string, scopes: string[]): Promise<string> {
    const apiKey = `cortex_${crypto.randomBytes(32).toString('hex')}`;
    const hash = await bcrypt.hash(apiKey, 10);
    const prefix = apiKey.substring(0, 12); // For identification

    db.prepare(`
      INSERT INTO api_keys (tenant_id, user_id, key_hash, key_prefix, scopes)
      VALUES (?, ?, ?, ?, ?)
    `).run(tenantId, userId, hash, prefix, JSON.stringify(scopes));

    return apiKey; // Return only once, never stored
  }

  // Verify API key
  async verifyApiKey(apiKey: string): Promise<{ tenantId: string; userId: string; scopes: string[] } | null> {
    const prefix = apiKey.substring(0, 12);
    
    const row: any = db.prepare(`
      SELECT tenant_id, user_id, key_hash, scopes 
      FROM api_keys 
      WHERE key_prefix = ? AND is_active = 1
    `).get(prefix);

    if (!row) return null;

    const valid = await bcrypt.compare(apiKey, row.key_hash);
    if (!valid) return null;

    return {
      tenantId: row.tenant_id,
      userId: row.user_id,
      scopes: JSON.parse(row.scopes)
    };
  }
}

export const vault = new VaultService();
```

---

### AI Memory & Retrieval (pgvector + OpenAI)

**Vector Search for Context-Aware AI**:

```typescript
// server/services/ai-memory.ts
import { OpenAI } from 'openai';
import Database from 'better-sqlite3';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export class AIMemoryService {
  // Generate embedding for text
  async generateEmbedding(text: string): Promise<number[]> {
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text
    });
    return response.data[0].embedding;
  }

  // Store conversation context with embedding
  async storeConversation(
    tenantId: string,
    userId: string,
    message: string,
    context: any
  ): Promise<void> {
    const embedding = await this.generateEmbedding(message);
    
    db.prepare(`
      INSERT INTO ai_conversations (tenant_id, user_id, message, context, embedding)
      VALUES (?, ?, ?, ?, ?)
    `).run(tenantId, userId, message, JSON.stringify(context), JSON.stringify(embedding));
  }

  // Retrieve relevant context using vector similarity
  async searchSimilarContext(
    tenantId: string,
    query: string,
    limit: number = 5
  ): Promise<any[]> {
    const queryEmbedding = await this.generateEmbedding(query);
    
    // SQLite doesn't have built-in vector similarity, so we do it in-memory
    // In production, use PostgreSQL with pgvector extension
    const rows: any[] = db.prepare(`
      SELECT id, message, context, embedding
      FROM ai_conversations
      WHERE tenant_id = ?
      ORDER BY created_at DESC
      LIMIT 100
    `).all(tenantId);

    // Calculate cosine similarity
    const withScores = rows.map(row => {
      const embedding = JSON.parse(row.embedding);
      const similarity = this.cosineSimilarity(queryEmbedding, embedding);
      return { ...row, similarity };
    });

    // Sort by similarity and return top N
    return withScores
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit)
      .map(row => ({
        message: row.message,
        context: JSON.parse(row.context),
        similarity: row.similarity
      }));
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
    const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
    return dotProduct / (magnitudeA * magnitudeB);
  }

  // Get contextual AI response with memory
  async getContextualResponse(
    tenantId: string,
    userId: string,
    userMessage: string
  ): Promise<string> {
    // Find similar past conversations
    const similarContexts = await this.searchSimilarContext(tenantId, userMessage, 3);
    
    // Build context for AI
    const contextPrompt = similarContexts.length > 0
      ? `\n\nRelevant past context:\n${similarContexts.map((c, i) => 
          `${i+1}. ${c.message} (similarity: ${(c.similarity * 100).toFixed(1)}%)`
        ).join('\n')}`
      : '';

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are the Universal AI Assistant for CortexBuild, a construction automation platform. 
          You help with procurement, workflows, mobile apps, and project management.${contextPrompt}`
        },
        { role: 'user', content: userMessage }
      ],
      temperature: 0.7
    });

    const assistantMessage = response.choices[0].message.content || '';

    // Store this conversation
    await this.storeConversation(tenantId, userId, userMessage, {
      response: assistantMessage,
      model: 'gpt-4o-mini'
    });

    return assistantMessage;
  }
}

export const aiMemory = new AIMemoryService();
```

---

## 🎨 Enhanced No-Code Builder & Sandbox

### Canvas UX Improvements

**Node Types with Visual Indicators**:

```typescript
export interface FlowNode {
  id: string;
  type: 'trigger' | 'condition' | 'action' | 'ai' | 'approval' | 'subflow';
  label: string;
  icon: React.ReactNode;
  config: NodeConfig;
  position: { x: number; y: number };
  status?: 'idle' | 'running' | 'success' | 'error';
  logs?: ExecutionLog[];
}

// Visual indicators per node type
const NODE_STYLES = {
  trigger: {
    color: 'from-blue-500 to-blue-600',
    icon: Zap,
    description: 'Starts the flow'
  },
  condition: {
    color: 'from-yellow-500 to-amber-600',
    icon: GitBranch,
    description: 'Branching logic'
  },
  action: {
    color: 'from-green-500 to-emerald-600',
    icon: Play,
    description: 'Performs an action'
  },
  ai: {
    color: 'from-purple-500 to-pink-600',
    icon: Sparkles,
    description: 'AI processing'
  },
  approval: {
    color: 'from-orange-500 to-red-600',
    icon: CheckCircle,
    description: 'Requires human approval'
  },
  subflow: {
    color: 'from-slate-500 to-gray-600',
    icon: Layers,
    description: 'Nested workflow'
  }
};
```

### Natural Language to Flow

**AI-Powered Flow Generation**:

```typescript
// server/services/flow-generator.ts
export class FlowGeneratorService {
  async generateFlowFromPrompt(
    tenantId: string,
    prompt: string
  ): Promise<{ nodes: FlowNode[]; edges: FlowEdge[] }> {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are a workflow automation expert. Convert natural language 
          descriptions into structured workflow graphs with nodes and edges.
          
          Available node types:
          - trigger: Starts the flow (webhook, schedule, event)
          - condition: If/else logic, comparisons
          - action: API calls, database updates, notifications
          - ai: AI analysis, text generation, data extraction
          - approval: Human-in-the-loop decision points
          - subflow: Call another workflow
          
          Return JSON with this structure:
          {
            "nodes": [
              { "id": "node-1", "type": "trigger", "label": "New RFQ Created", "config": {...} },
              { "id": "node-2", "type": "condition", "label": "Check Budget", "config": {...} }
            ],
            "edges": [
              { "source": "node-1", "target": "node-2" }
            ]
          }`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      response_format: { type: 'json_object' }
    });

    const generated = JSON.parse(response.choices[0].message.content || '{}');
    
    // Position nodes automatically (grid layout)
    const nodesWithPositions = generated.nodes.map((node: any, index: number) => ({
      ...node,
      position: {
        x: 100 + (index % 3) * 250,
        y: 100 + Math.floor(index / 3) * 150
      }
    }));

    return {
      nodes: nodesWithPositions,
      edges: generated.edges
    };
  }
}

// Example usage:
// Prompt: "When a bid is received, score it and notify procurement if it's below threshold."
//
// Generated Flow:
// 1. Trigger: "Bid Received" (webhook)
// 2. AI: "Score Bid" (GPT-4 analysis with rubric)
// 3. Condition: "Score < 70?"
//    ├─ Yes → Action: "Send Email to Procurement"
//    └─ No → Action: "Auto-approve Bid"
// 4. End
```

---

## 📦 Key Features Enhancement

### Step Logs & Versioning

```typescript
interface FlowExecution {
  id: string;
  flowId: string;
  tenantId: string;
  version: number;
  status: 'running' | 'completed' | 'failed';
  startedAt: Date;
  completedAt?: Date;
  steps: StepLog[];
}

interface StepLog {
  nodeId: string;
  nodeLabel: string;
  status: 'pending' | 'running' | 'success' | 'error' | 'skipped';
  startedAt: Date;
  completedAt?: Date;
  input: any;
  output: any;
  error?: string;
  duration: number; // milliseconds
}

// Versioning system
interface FlowVersion {
  flowId: string;
  version: number;
  nodes: FlowNode[];
  edges: FlowEdge[];
  createdBy: string;
  createdAt: Date;
  changelog: string;
  isActive: boolean;
}

// Rollback to previous version
export const rollbackFlow = async (flowId: string, targetVersion: number) => {
  const version = db.prepare(`
    SELECT * FROM flow_versions 
    WHERE flow_id = ? AND version = ?
  `).get(flowId, targetVersion);

  if (!version) throw new Error('Version not found');

  // Create new version from old one
  const currentMaxVersion: any = db.prepare(`
    SELECT MAX(version) as max FROM flow_versions WHERE flow_id = ?
  `).get(flowId);

  const newVersion = (currentMaxVersion?.max || 0) + 1;

  db.prepare(`
    INSERT INTO flow_versions (flow_id, version, nodes, edges, changelog, created_by)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    flowId,
    newVersion,
    version.nodes,
    version.edges,
    `Rolled back to version ${targetVersion}`,
    'system'
  );

  // Update active flow
  db.prepare(`
    UPDATE automation_flows 
    SET nodes = ?, edges = ?, active_version = ?
    WHERE id = ?
  `).run(version.nodes, version.edges, newVersion, flowId);
};
```

### Templates Gallery

```typescript
export const FLOW_TEMPLATES = [
  {
    id: 'procurement-rfq-notification',
    name: 'RFQ Auto-Notification',
    category: 'procurement',
    description: 'Automatically notify vendors when new RFQ is created',
    nodes: [
      { id: '1', type: 'trigger', label: 'RFQ Created', config: { event: 'rfq.created' } },
      { id: '2', type: 'action', label: 'Get Vendor List', config: { source: 'database', query: 'SELECT * FROM vendors WHERE category = {{rfq.category}}' } },
      { id: '3', type: 'action', label: 'Send Emails', config: { template: 'rfq-invitation', recipients: '{{vendors}}' } },
      { id: '4', type: 'action', label: 'Log Activity', config: { message: 'RFQ {{rfq.id}} sent to {{vendor_count}} vendors' } }
    ],
    edges: [
      { source: '1', target: '2' },
      { source: '2', target: '3' },
      { source: '3', target: '4' }
    ]
  },
  {
    id: 'bid-scoring',
    name: 'AI Bid Scoring',
    category: 'procurement',
    description: 'Score bids using AI and notify if below threshold',
    nodes: [
      { id: '1', type: 'trigger', label: 'Bid Submitted', config: { event: 'bid.submitted' } },
      { id: '2', type: 'ai', label: 'Score Bid', config: { prompt: 'Score this bid based on price, timeline, vendor reputation. Return score 0-100.' } },
      { id: '3', type: 'condition', label: 'Score < 70?', config: { field: 'score', operator: 'lt', value: 70 } },
      { id: '4a', type: 'action', label: 'Notify Procurement', config: { method: 'email', to: 'procurement@company.com' } },
      { id: '4b', type: 'action', label: 'Auto-approve', config: { updateStatus: 'approved' } }
    ],
    edges: [
      { source: '1', target: '2' },
      { source: '2', target: '3' },
      { source: '3', target: '4a', condition: 'yes' },
      { source: '3', target: '4b', condition: 'no' }
    ]
  },
  {
    id: 'safety-incident-alert',
    name: 'Safety Incident Alert',
    category: 'safety',
    description: 'Immediate alerts for high-severity safety incidents',
    nodes: [
      { id: '1', type: 'trigger', label: 'Incident Reported', config: { event: 'incident.created' } },
      { id: '2', type: 'condition', label: 'Severity >= High?', config: { field: 'severity', operator: 'gte', value: 'high' } },
      { id: '3', type: 'action', label: 'SMS to Safety Officer', config: { phone: '{{project.safety_officer_phone}}' } },
      { id: '4', type: 'action', label: 'Email to Management', config: { to: 'management@company.com' } },
      { id: '5', type: 'action', label: 'Create Jira Ticket', config: { project: 'SAFETY', priority: 'Critical' } }
    ],
    edges: [
      { source: '1', target: '2' },
      { source: '2', target: '3', condition: 'yes' },
      { source: '3', target: '4' },
      { source: '4', target: '5' }
    ]
  }
];
```

---

## 🤖 Enhanced Universal Assistant

### Cmd+K Command Palette with AI

```typescript
interface CommandAction {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  keywords: string[];
  category: 'procurement' | 'flow' | 'app' | 'analytics' | 'settings';
  action: (context?: any) => Promise<void>;
  requiresAI?: boolean;
}

const COMMANDS: CommandAction[] = [
  {
    id: 'create-rfq',
    label: 'Create new RFQ',
    description: 'Start a new Request for Quote',
    icon: <FileText />,
    keywords: ['rfq', 'request', 'quote', 'procurement', 'vendor'],
    category: 'procurement',
    action: async () => {
      // Open RFQ creation modal
    }
  },
  {
    id: 'analyze-vendor-risk',
    label: 'Show vendor risk scores',
    description: 'AI-powered vendor risk analysis',
    icon: <AlertTriangle />,
    keywords: ['vendor', 'risk', 'score', 'analyze', 'ai'],
    category: 'analytics',
    requiresAI: true,
    action: async () => {
      const analysis = await aiMemory.getContextualResponse(
        tenantId,
        userId,
        'Analyze vendor risk scores for all active vendors'
      );
      // Display analysis in modal
    }
  },
  {
    id: 'create-flow',
    label: 'Create automation flow',
    description: 'Build a new workflow',
    icon: <Workflow />,
    keywords: ['flow', 'workflow', 'automation', 'create'],
    category: 'flow',
    action: async () => {
      // Open flow builder
    }
  },
  {
    id: 'ai-generate-flow',
    label: 'Generate flow with AI',
    description: 'Describe workflow in natural language',
    icon: <Sparkles />,
    keywords: ['ai', 'generate', 'flow', 'natural', 'language'],
    category: 'flow',
    requiresAI: true,
    action: async (context) => {
      // Prompt user for description
      const description = context.userInput;
      const generated = await flowGenerator.generateFlowFromPrompt(tenantId, description);
      // Open flow builder with generated flow
    }
  }
];
```

### Contextual Chat with Function Calling

```typescript
const ASSISTANT_FUNCTIONS = [
  {
    name: 'create_rfq',
    description: 'Create a new Request for Quote',
    parameters: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'RFQ title' },
        category: { type: 'string', enum: ['materials', 'labor', 'equipment', 'services'] },
        items: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              description: { type: 'string' },
              quantity: { type: 'number' },
              unit: { type: 'string' }
            }
          }
        },
        dueDate: { type: 'string', format: 'date' },
        preferredVendors: { type: 'array', items: { type: 'string' } }
      },
      required: ['title', 'category', 'items', 'dueDate']
    }
  },
  {
    name: 'search_vendors',
    description: 'Search for vendors by category or name',
    parameters: {
      type: 'object',
      properties: {
        category: { type: 'string' },
        searchTerm: { type: 'string' },
        minRating: { type: 'number', minimum: 1, maximum: 5 }
      }
    }
  },
  {
    name: 'generate_procurement_dashboard',
    description: 'Create a custom dashboard for procurement metrics',
    parameters: {
      type: 'object',
      properties: {
        metrics: {
          type: 'array',
          items: {
            type: 'string',
            enum: ['open_rfqs', 'pending_bids', 'approved_pos', 'spend_by_category', 'vendor_performance']
          }
        },
        timeRange: { type: 'string', enum: ['7d', '30d', '90d', '1y'] }
      },
      required: ['metrics']
    }
  }
];

// Function calling implementation
export const handleAssistantChat = async (
  tenantId: string,
  userId: string,
  message: string
) => {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: 'You are the Universal AI Assistant for CortexBuild. You can create RFQs, search vendors, generate reports, and more.'
      },
      { role: 'user', content: message }
    ],
    functions: ASSISTANT_FUNCTIONS,
    function_call: 'auto'
  });

  const assistantMessage = response.choices[0].message;

  if (assistantMessage.function_call) {
    const functionName = assistantMessage.function_call.name;
    const functionArgs = JSON.parse(assistantMessage.function_call.arguments);

    // Execute the function
    let functionResult;
    switch (functionName) {
      case 'create_rfq':
        functionResult = await createRFQ(tenantId, functionArgs);
        break;
      case 'search_vendors':
        functionResult = await searchVendors(tenantId, functionArgs);
        break;
      case 'generate_procurement_dashboard':
        functionResult = await generateDashboard(tenantId, functionArgs);
        break;
    }

    // Send function result back to AI for natural language response
    const followUp = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'user', content: message },
        assistantMessage,
        {
          role: 'function',
          name: functionName,
          content: JSON.stringify(functionResult)
        }
      ]
    });

    return {
      message: followUp.choices[0].message.content,
      action: {
        type: functionName,
        result: functionResult
      }
    };
  }

  return {
    message: assistantMessage.content,
    action: null
  };
};
```

---

## 🛠️ Marketplace Mechanics Enhancement

### Discovery with Trust Scores

```typescript
interface MarketplaceApp {
  id: string;
  name: string;
  description: string;
  category: string[];
  version: string;
  publisherId: string;
  publisherName: string;
  publisherVerified: boolean;
  
  // Trust & Quality Metrics
  trustScore: number; // 0-100 calculated score
  installCount: number;
  activeInstalls: number;
  rating: number; // 1-5 stars
  reviewCount: number;
  lastUpdated: Date;
  
  // Security
  securityAuditPassed: boolean;
  securityAuditDate?: Date;
  permissions: string[]; // ['read:projects', 'write:rfqs', etc.]
  
  // Pricing
  pricingModel: 'free' | 'paid' | 'subscription';
  price?: number;
  subscriptionPrice?: number;
  
  // Package integrity
  packageHash: string; // SHA-256 of package content
  signatureValid: boolean;
}

// Trust score calculation
export const calculateTrustScore = (app: MarketplaceApp): number => {
  let score = 50; // Base score

  // Verified publisher (+20)
  if (app.publisherVerified) score += 20;

  // Security audit (+15)
  if (app.securityAuditPassed) score += 15;

  // Install count (max +10)
  score += Math.min(Math.log10(app.installCount + 1) * 2, 10);

  // Rating (max +10)
  score += (app.rating / 5) * 10;

  // Review count (max +5)
  score += Math.min(Math.log10(app.reviewCount + 1), 5);

  // Recent update (+5 if updated in last 90 days)
  const daysSinceUpdate = (Date.now() - app.lastUpdated.getTime()) / (1000 * 60 * 60 * 24);
  if (daysSinceUpdate < 90) score += 5;

  return Math.min(Math.round(score), 100);
};
```

### Safe Upgrades with Semver

```typescript
interface AppVersion {
  appId: string;
  version: string; // Semantic versioning: MAJOR.MINOR.PATCH
  releaseNotes: string;
  breaking: boolean; // true if MAJOR version bump
  deprecated: boolean;
  deprecationDate?: Date;
  migrationGuide?: string;
}

export const checkUpgradeSafety = (
  currentVersion: string,
  targetVersion: string
): { safe: boolean; warnings: string[] } => {
  const current = semver.parse(currentVersion);
  const target = semver.parse(targetVersion);

  const warnings: string[] = [];

  // Major version change = breaking
  if (target.major > current.major) {
    warnings.push('⚠️ This is a MAJOR version upgrade with breaking changes');
    warnings.push('Review migration guide before upgrading');
    return { safe: false, warnings };
  }

  // Minor version = new features (safe)
  if (target.minor > current.minor) {
    warnings.push('✅ New features available');
    return { safe: true, warnings };
  }

  // Patch version = bug fixes (always safe)
  if (target.patch > current.patch) {
    warnings.push('✅ Bug fixes and improvements');
    return { safe: true, warnings };
  }

  return { safe: true, warnings };
};

// Automatic rollback on failure
export const upgradeAppWithRollback = async (
  tenantId: string,
  appId: string,
  targetVersion: string
) => {
  // Snapshot current state
  const currentVersion = await getCurrentAppVersion(tenantId, appId);
  const snapshot = await createAppSnapshot(tenantId, appId);

  try {
    // Perform upgrade
    await installAppVersion(tenantId, appId, targetVersion);
    
    // Run health checks
    const healthChecks = await runAppHealthChecks(tenantId, appId);
    
    if (!healthChecks.passed) {
      throw new Error('Health checks failed after upgrade');
    }

    // Success - delete snapshot after 24h
    setTimeout(() => deleteSnapshot(snapshot.id), 24 * 60 * 60 * 1000);
    
    return { success: true, version: targetVersion };
  } catch (error) {
    // Automatic rollback
    console.error('Upgrade failed, rolling back:', error);
    await restoreAppSnapshot(tenantId, appId, snapshot.id);
    
    // Notify user
    await notifyUpgradeFailure(tenantId, appId, currentVersion, targetVersion, error);
    
    return { success: false, error: error.message, rolledBack: true };
  }
};
```

### Signed Packages & Audit Logs

```typescript
// Package signing
export const signPackage = async (packageContent: Buffer): Promise<string> => {
  const privateKey = process.env.PACKAGE_SIGNING_KEY!;
  const sign = crypto.createSign('RSA-SHA256');
  sign.update(packageContent);
  return sign.sign(privateKey, 'hex');
};

export const verifyPackageSignature = (
  packageContent: Buffer,
  signature: string
): boolean => {
  const publicKey = process.env.PACKAGE_PUBLIC_KEY!;
  const verify = crypto.createVerify('RSA-SHA256');
  verify.update(packageContent);
  return verify.verify(publicKey, signature, 'hex');
};

// Installation audit logging
export const logAppInstallation = async (
  tenantId: string,
  userId: string,
  appId: string,
  version: string,
  action: 'install' | 'upgrade' | 'uninstall'
) => {
  db.prepare(`
    INSERT INTO app_audit_logs (
      tenant_id, user_id, app_id, version, action, 
      ip_address, user_agent, timestamp
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    tenantId,
    userId,
    appId,
    version,
    action,
    req.ip,
    req.headers['user-agent'],
    new Date().toISOString()
  );

  // Also log to centralized audit system
  await logSecurityEvent({
    tenantId,
    userId,
    eventType: `marketplace.app.${action}`,
    metadata: { appId, version },
    severity: action === 'uninstall' ? 'low' : 'medium'
  });
};
```

---

## 📊 Implementation Checklist

### Phase 1: Subscriptions & Billing (Week 1)

- [ ] Database schema for subscriptions, plans, usage tracking
- [ ] Stripe integration for payment processing
- [ ] Subscription management UI in Developer Dashboard
- [ ] Usage metering (flow runs, API calls, AI queries)
- [ ] Quota enforcement middleware
- [ ] Upgrade/downgrade flows with prorated billing

### Phase 2: Enhanced Security (Week 2)

- [ ] Vault service for secrets management
- [ ] Encrypted storage for OAuth tokens and API keys
- [ ] Role-based secret access control
- [ ] API key generation with prefix-based verification
- [ ] Audit logging for all secret access
- [ ] Secret rotation policies

### Phase 3: AI Memory & Context (Week 2-3)

- [ ] Vector embeddings storage (migrate to PostgreSQL + pgvector)
- [ ] Conversation history with embeddings
- [ ] Contextual similarity search
- [ ] Function calling integration
- [ ] Multi-turn conversation support
- [ ] Context-aware suggestions

### Phase 4: Flow Builder Enhancements (Week 3-4)

- [ ] Natural language flow generation
- [ ] Step-by-step execution logs
- [ ] Flow versioning system
- [ ] Rollback functionality
- [ ] Template gallery UI
- [ ] Test harness with live data
- [ ] Snapshot/restore for drafts

### Phase 5: Universal Assistant (Week 4-5)

- [ ] Enhanced Cmd+K palette with AI
- [ ] Function calling for actions
- [ ] Context-aware chat widget
- [ ] Example prompts library
- [ ] Voice input support
- [ ] Multi-language support

### Phase 6: Marketplace (Week 5-6)

- [ ] Trust score calculation algorithm
- [ ] Security audit workflow
- [ ] Package signing & verification
- [ ] Semver upgrade safety checks
- [ ] Automatic rollback on failure
- [ ] Deprecation notices system
- [ ] Revenue sharing & payouts

---

## 🎯 Success Metrics

### Platform Metrics

- **Developer Adoption**: 1,000+ registered developers in 6 months
- **Active Flows**: 10,000+ automation flows running daily
- **AI Assistant Usage**: 50,000+ queries per month
- **Marketplace Apps**: 100+ published apps by end of year
- **Revenue**: $50K MRR by month 12

### Quality Metrics

- **Platform Uptime**: 99.9% SLA
- **Average Flow Execution Time**: < 2 seconds
- **AI Response Time**: < 3 seconds
- **Marketplace App Trust Score**: Average 80+
- **User Satisfaction**: NPS > 50

---

**Last Updated**: October 9, 2025  
**Version**: 2.0  
**Status**: Implementation Ready
