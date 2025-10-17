# 🚀 Quick Reference - Developer Console & OpenAI Features

## 🎮 ACCESSING DEVELOPER CONSOLE

### **For Super Admin**
1. Login: `adrian.stanca1@gmail.com` / `password123`
2. Navigate to: **"SDK Developer"** tab (6th tab in Super Admin Dashboard)
3. Full access to all features

### **For Regular Users**
1. Login with your account
2. Navigate to: **"SDK Developer"** tab
3. See upgrade modal to get access

---

## 🤖 OPENAI INTEGRATION STATUS

### **Current Setup**
- ✅ OpenAI SDK installed (`npm install openai`)
- ✅ GPT-4 Turbo configured as primary model
- ✅ API key environment variable: `OPENAI_API_KEY`

### **Required Configuration**
```bash
# Add to .env.local
OPENAI_API_KEY=sk-...your-key-here...
```

### **AI Features Available**
| Feature | Status | Model | Use Case |
|---------|--------|-------|----------|
| Code Generation | ✅ | GPT-4 Turbo | Natural language → Code |
| Developer Chat | ✅ | GPT-4 Turbo | SDK assistance |
| Code Analysis | ✅ | GPT-4 Turbo | Security & quality |
| Test Generation | ✅ | GPT-4 Turbo | Jest + RTL tests |

---

## 💳 SUBSCRIPTION TIERS

### **Pricing & Limits**
```
FREE        → $0/mo   → 10 API requests/month
STARTER     → $99/mo  → 100 API requests/month
PRO         → $299/mo → 1,000 API requests/month
ENTERPRISE  → Custom  → Unlimited requests
```

### **Feature Availability**
```
Free:        Basic projects, basic tasks
Starter:     + ML analytics, AI agents (3), advanced reporting
Pro:         + Unlimited modules, all AI features
Enterprise:  + Custom integrations, SSO, dedicated support
```

---

## 🎯 DEVELOPER CONSOLE TABS

### **1. AI App Builder**
- Natural language to code generation
- Live sandbox with preview
- Syntax highlighting
- Real-time testing

### **2. Workflow Builder**
- Visual drag-and-drop interface
- 25+ pre-built nodes
- Trigger, action, condition, delay nodes
- Workflow execution monitoring

### **3. AI Agents Dashboard**
- Create & manage AI agents
- Pre-built agent templates
- Autonomous task execution
- Performance tracking

### **4. Templates Gallery**
- Pre-built code templates
- Category filtering
- One-click installation
- Ratings & reviews

### **5. Integrations Hub**
- Third-party integrations
- Webhook management
- API key generation
- Custom integrations

### **6. Settings**
- API key management
- Subscription tier info
- Usage statistics
- Account settings

---

## 🤖 AI AGENTS AVAILABLE

### **Pre-built Agents**
1. **HSE Sentinel** - Health, Safety & Environment
2. **Project Controls** - Schedule & cost analysis
3. **Financial Forecaster** - Budget & cash flow
4. **Commercial Guardian** - Contract management
5. **Quality Inspector** - Quality assurance

### **Agent Capabilities**
- Risk assessment & scoring
- Compliance checking
- Predictive analytics
- Autonomous execution
- Real-time monitoring

---

## 📊 API ENDPOINTS

### **SDK Developer Endpoints**
```
GET  /api/sdk/developer/status      - Developer status
POST /api/sdk/ai/chat               - Developer chatbot
GET  /api/sdk/usage                 - Usage statistics
POST /api/sdk/apps/*                - App management
POST /api/sdk/workflows/*           - Workflow CRUD
POST /api/sdk/agents/*              - Agent management
```

### **Admin Endpoints**
```
GET  /api/admin/sdk/usage           - Overall usage
GET  /api/admin/sdk/usage/by-user   - Per-user breakdown
GET  /api/admin/sdk/usage/recent    - Recent requests
GET  /api/admin/sdk/usage/export    - CSV export
PATCH /api/admin/sdk/users/:id/tier - Update tier
```

---

## 🔐 SECURITY & LIMITS

### **Rate Limiting**
- Free: 10 requests/month
- Starter: 100 requests/month
- Pro: 1,000 requests/month
- Enterprise: Unlimited

### **Token Tracking**
- Prompt tokens counted
- Completion tokens tracked
- Total tokens calculated
- Cost estimated per request

### **Access Control**
- Super admin: Unlimited
- SDK developers: Tier-based
- Regular users: Upgrade required
- API key authentication

---

## 🚀 GETTING STARTED

### **Step 1: Add OpenAI API Key**
```bash
# .env.local
OPENAI_API_KEY=sk-...your-key-here...
```

### **Step 2: Access Developer Console**
1. Login as Super Admin
2. Go to "SDK Developer" tab
3. Start building!

### **Step 3: Generate Code**
1. Click "AI App Builder"
2. Enter natural language prompt
3. Get production-ready code
4. Test in sandbox

### **Step 4: Monitor Usage**
1. Go to "Settings"
2. View API usage statistics
3. Check token consumption
4. Monitor costs

---

## 📈 MONITORING & ANALYTICS

### **Available Metrics**
- Total API requests
- Total tokens used
- Estimated costs
- Provider & model breakdown
- Request timestamps
- User attribution

### **Export Options**
- CSV export of usage data
- Per-user breakdown
- Recent requests log
- Cost analysis

---

## ✅ PRODUCTION CHECKLIST

- [ ] OpenAI API key configured
- [ ] Subscription tier set
- [ ] Usage limits configured
- [ ] Webhooks configured
- [ ] API keys generated
- [ ] Monitoring enabled
- [ ] Backup plan ready

---

## 🆘 TROUBLESHOOTING

### **Issue: "SDK Developer access required"**
- Solution: Contact Super Admin for tier upgrade

### **Issue: "API rate limit exceeded"**
- Solution: Upgrade subscription tier

### **Issue: "OpenAI API error"**
- Solution: Check OPENAI_API_KEY in .env.local

### **Issue: "Code generation timeout"**
- Solution: Try shorter prompts or upgrade tier

---

## 📚 DOCUMENTATION

- Full docs: `DEVELOPER_CONSOLE_OPENAI_UPGRADES_AUDIT.md`
- SDK guide: `SDK_IMPLEMENTATION_COMPLETE.md`
- API reference: `BASE44_WORKSPACE_OVERVIEW.md`

---

**Status**: ✅ PRODUCTION-READY

