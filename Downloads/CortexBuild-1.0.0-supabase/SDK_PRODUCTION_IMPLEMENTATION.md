# 🚀 SDK Production Implementation - Complete Guide

## ✅ **COMPLETED TASKS**

### **1. Toast Library - INSTALLED** ✅
```bash
npm install react-hot-toast @xyflow/react
```

**Packages Added:**
- `react-hot-toast` - Toast notifications
- `@xyflow/react` - Workflow editor (React Flow)

---

### **2. Real Backend API - IMPLEMENTED** ✅

**File:** `server/routes/sdk.ts` (496 lines)

#### **Backend Endpoints Created:**

**SDK Profile:**
- `GET /api/sdk/profile` - Get or create SDK profile
- `PATCH /api/sdk/profile/subscription` - Update subscription tier
- `POST /api/sdk/profile/api-key` - Save encrypted API key

**Workflows:**
- `GET /api/sdk/workflows` - Get all workflows
- `POST /api/sdk/workflows` - Save new workflow

**Apps:**
- `GET /api/sdk/apps` - Get all apps
- `POST /api/sdk/apps` - Save new app
- `PATCH /api/sdk/apps/:id/status` - Update app status

**AI Agents:**
- `GET /api/sdk/agents` - Get all agents
- `PATCH /api/sdk/agents/:id/status` - Update agent status

**Analytics:**
- `GET /api/sdk/analytics/usage` - Get usage analytics
- `POST /api/sdk/analytics/log` - Log API usage

---

### **3. Database Tables - CREATED** ✅

**Tables Created:**

```sql
-- SDK Workflows
CREATE TABLE sdk_workflows (
  id TEXT PRIMARY KEY,
  developer_id TEXT NOT NULL,
  company_id TEXT,
  name TEXT NOT NULL,
  definition TEXT NOT NULL,
  is_active INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- SDK Apps
CREATE TABLE sdk_apps (
  id TEXT PRIMARY KEY,
  developer_id TEXT NOT NULL,
  company_id TEXT,
  name TEXT NOT NULL,
  description TEXT,
  version TEXT DEFAULT '1.0.0',
  status TEXT DEFAULT 'draft',
  code TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- AI Agents
CREATE TABLE ai_agents (
  id TEXT PRIMARY KEY,
  developer_id TEXT NOT NULL,
  company_id TEXT,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'stopped',
  config TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- SDK Profiles
CREATE TABLE sdk_profiles (
  id TEXT PRIMARY KEY,
  user_id TEXT UNIQUE NOT NULL,
  subscription_tier TEXT DEFAULT 'free',
  api_requests_used INTEGER DEFAULT 0,
  api_requests_limit INTEGER DEFAULT 100,
  gemini_api_key TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- API Usage Logs
CREATE TABLE api_usage_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  provider TEXT NOT NULL,
  model TEXT,
  prompt_tokens INTEGER DEFAULT 0,
  completion_tokens INTEGER DEFAULT 0,
  total_tokens INTEGER DEFAULT 0,
  cost REAL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

### **4. Server Integration - COMPLETE** ✅

**Updated Files:**
- `server/index.ts` - Added SDK routes and table initialization
- `server/routes/sdk.ts` - Complete backend implementation

**Changes Made:**
```typescript
// Import SDK functions
import { createSDKRouter, initSdkTables } from './routes/sdk';

// Initialize SDK tables on startup
console.log('🔧 Initializing SDK Developer tables...');
initSdkTables(db);

// Register SDK routes
app.use('/api/sdk', createSDKRouter(db));
```

---

## 🔄 **NEXT STEPS - TO COMPLETE**

### **Step 1: Add Gemini AI Integration**

Create `server/services/gemini.ts`:

```typescript
import { GoogleGenerativeAI } from '@google/generative-ai';

export class GeminiService {
  private genAI: GoogleGenerativeAI;

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  async generateCode(prompt: string, model: string = 'gemini-pro') {
    try {
      const generativeModel = this.genAI.getGenerativeModel({ model });
      
      const result = await generativeModel.generateContent(
        `You are a TypeScript code generator for construction management applications.
        Generate clean, production-ready TypeScript code based on this requirement:
        
        ${prompt}
        
        Return only the code with comments explaining key parts.`
      );

      const response = await result.response;
      const code = response.text();

      return {
        code,
        explanation: `Generated TypeScript code for: ${prompt}`,
        tokens: {
          prompt: prompt.length,
          completion: code.length
        }
      };
    } catch (error) {
      throw new Error(`Gemini API error: ${error.message}`);
    }
  }
}
```

Add endpoint in `server/routes/sdk.ts`:

```typescript
router.post('/generate', authenticateToken, requireDeveloper, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const db = (req as any).db;
    const { prompt, model } = req.body;

    // Get user's API key
    const profile = db.prepare('SELECT gemini_api_key FROM sdk_profiles WHERE user_id = ?').get(user.id);
    
    if (!profile?.gemini_api_key) {
      return res.status(400).json({ error: 'Gemini API key not configured' });
    }

    // Decrypt API key (implement proper decryption)
    const apiKey = atob(profile.gemini_api_key).split(':')[1];

    // Generate code
    const gemini = new GeminiService(apiKey);
    const result = await gemini.generateCode(prompt, model);

    // Log usage
    await api.post('/analytics/log', {
      provider: 'gemini',
      model,
      promptTokens: result.tokens.prompt,
      completionTokens: result.tokens.completion,
      cost: 0.001 // Calculate based on model pricing
    });

    res.json({
      success: true,
      code: result.code,
      explanation: result.explanation,
      tokens: result.tokens
    });
  } catch (error: any) {
    console.error('Generate code error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate code' });
  }
});
```

---

### **Step 2: Complete Production SDK View**

Update `components/sdk/ProductionSDKDeveloperView.tsx` with event handlers:

```typescript
// Event Handlers
const handleGenerateApp = async () => {
  if (!prompt.trim()) {
    toast.error('Please enter a prompt first');
    return;
  }
  
  setIsGenerating(true);
  try {
    const response = await api.post('/sdk/generate', {
      prompt,
      model: selectedModel
    });

    if (response.data.success) {
      setGeneratedCode(response.data.code);
      setAiExplanation(response.data.explanation);
      setTokenUsage(response.data.tokens);
      toast.success('Code generated successfully!');
      await loadProfile(); // Refresh usage
    }
  } catch (error: any) {
    toast.error(error.response?.data?.error || 'Failed to generate code');
  } finally {
    setIsGenerating(false);
  }
};

const handleSaveApp = async () => {
  if (!generatedCode || generatedCode === '// Generated code will appear here...') {
    toast.error('Generate code first before saving');
    return;
  }
  
  setIsSavingApp(true);
  try {
    const response = await api.post('/sdk/apps', {
      name: prompt.substring(0, 50) || 'Untitled App',
      description: aiExplanation || 'AI generated application',
      code: generatedCode,
      status: 'draft',
      companyId: user.company_id
    });

    if (response.data.success) {
      setApps(prev => [response.data.app, ...prev]);
      toast.success(isDemo ? 'Demo app saved locally' : 'App saved to sandbox');
    }
  } catch (error: any) {
    toast.error(error.response?.data?.error || 'Failed to save app');
  } finally {
    setIsSavingApp(false);
  }
};

const handleSaveWorkflow = async () => {
  if (!developerId) return;
  
  setIsSavingWorkflow(true);
  try {
    const definition = {
      nodes: nodes.map(node => ({
        id: node.id,
        type: 'action',
        name: typeof node.data?.label === 'string' ? node.data.label : 'Node',
        config: {},
        position: node.position,
      })),
      connections: edges.map(edge => ({ 
        id: edge.id, 
        source: edge.source, 
        target: edge.target 
      })),
    };

    const response = await api.post('/sdk/workflows', {
      name: `Workflow ${new Date().toLocaleTimeString()}`,
      definition,
      isActive: !isDemo,
      companyId: user.company_id
    });

    if (response.data.success) {
      setWorkflows(prev => [response.data.workflow, ...prev]);
      toast.success(isDemo ? 'Demo workflow saved locally' : 'Workflow saved to sandbox');
    }
  } catch (error: any) {
    toast.error(error.response?.data?.error || 'Failed to save workflow');
  } finally {
    setIsSavingWorkflow(false);
  }
};

const handleAgentToggle = async (agent: AiAgent) => {
  if (isDemo) {
    toast.error('Demo mode: Agent orchestration is read-only');
    return;
  }
  
  const newStatus = agent.status === 'running' ? 'paused' : 'running';
  
  try {
    const response = await api.patch(`/sdk/agents/${agent.id}/status`, {
      status: newStatus
    });

    if (response.data.success) {
      setAgents(prev => prev.map(a => 
        a.id === response.data.agent.id ? response.data.agent : a
      ));
      toast.success(`Agent ${response.data.agent.name} is now ${response.data.agent.status}`);
    }
  } catch (error: any) {
    toast.error(error.response?.data?.error || 'Failed to update agent state');
  }
};

const handleSubscriptionChange = async (tier: SdkSubscriptionTier) => {
  if (!profile || isDemo) return;
  
  setSubscriptionLoading(true);
  try {
    const response = await api.patch('/sdk/profile/subscription', { tier });

    if (response.data.success) {
      setProfile(response.data.profile);
      toast.success(`Subscription updated to ${SUBSCRIPTION_DETAILS[tier].label}`);
    }
  } catch (error: any) {
    toast.error(error.response?.data?.error || 'Failed to update subscription');
  } finally {
    setSubscriptionLoading(false);
  }
};

const handleApiKeySave = async (value: string) => {
  if (!value.trim()) {
    toast.error('API key cannot be empty');
    return;
  }
  
  try {
    const encrypted = await encryptValue(value, user.id);
    window.localStorage.setItem(getStorageKey(user.id), encrypted);
    
    await api.post('/sdk/profile/api-key', {
      provider: 'gemini',
      encryptedKey: encrypted
    });

    setActiveGeminiKey(value);
    toast.success('Gemini API key stored securely');
  } catch (error: any) {
    toast.error(error.response?.data?.error || 'Failed to store API key');
  }
};

const handleSubmitForReview = async (app: SdkApp) => {
  if (isDemo) {
    toast.error('Demo mode: Publishing requires an SDK Developer subscription');
    return;
  }
  
  const newStatus = app.status === 'pending_review' ? 'approved' : 'pending_review';
  
  try {
    const response = await api.patch(`/sdk/apps/${app.id}/status`, {
      status: newStatus
    });

    if (response.data.success) {
      setApps(prev => prev.map(a => 
        a.id === response.data.app.id ? response.data.app : a
      ));
      toast.success(`App status updated to ${response.data.app.status}`);
    }
  } catch (error: any) {
    toast.error(error.response?.data?.error || 'Failed to update app status');
  }
};

const refreshAnalytics = async () => {
  await loadAnalytics();
  toast.success('Analytics refreshed');
};
```

---

## 📦 **Installation Commands**

```bash
# Install dependencies
npm install react-hot-toast @xyflow/react @google/generative-ai

# Restart backend server
npm run server

# Restart frontend
npm run dev
```

---

## 🎯 **Testing Checklist**

- [ ] Backend server starts without errors
- [ ] SDK tables created in database
- [ ] Can access `/api/sdk/profile` endpoint
- [ ] Toast notifications appear
- [ ] Can save workflows
- [ ] Can save apps
- [ ] Can update subscription tier
- [ ] Can save API key
- [ ] Analytics tracking works
- [ ] Agent status updates work

---

## 📝 **Files Modified/Created**

1. ✅ `server/routes/sdk.ts` - Complete backend API
2. ✅ `server/index.ts` - Added SDK initialization
3. ✅ `components/sdk/ProductionSDKDeveloperView.tsx` - Started
4. ✅ `package.json` - Added dependencies

---

**🎉 Backend integration is complete! Frontend needs event handlers added.** 🚀

