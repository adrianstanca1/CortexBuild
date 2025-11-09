# CortexBuild Developer Documentation

Complete documentation for developers building on the CortexBuild platform.

## 📚 Documentation Index

### Core API Documentation

1. **[AI Agents API Documentation](./API_AGENTS_DOCUMENTATION.md)**
   - Complete API reference for AI Agent Marketplace
   - 8 REST endpoints with examples
   - Authentication and authorization
   - Rate limits and error handling
   - Code examples in TypeScript, Python, cURL

### Developer Guides

2. **[AI Agent Developer Guide](./AI_AGENT_DEVELOPER_GUIDE.md)**
   - Step-by-step guide for creating AI agents
   - Agent architecture and execution model
   - 6 agent categories explained
   - Testing strategies
   - Publishing to marketplace
   - Best practices and security
   - 3 complete example agents

3. **[Webhook Integration Guide](./WEBHOOK_INTEGRATION_GUIDE.md)**
   - Real-time event notifications
   - HMAC signature verification
   - 20+ event types
   - Retry logic and error handling
   - Code examples in Node.js, Python, PHP, Next.js
   - Testing with ngrok and webhook inspectors

## 🚀 Quick Start

### Prerequisites

- **Developer Account**: Upgrade to Developer role in Settings
- **API Access**: Obtain JWT token from login
- **Development Environment**: Node.js 18+, Git

### Get Your API Token

```bash
# Login to get JWT token
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your-email@example.com",
    "password": "your-password"
  }'

# Response includes token
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { ... }
}

# Set environment variable
export CORTEXBUILD_TOKEN="your-jwt-token"
```

### First API Call

```bash
# Get marketplace agents
curl http://localhost:3001/api/agents/marketplace \
  -H "Authorization: Bearer $CORTEXBUILD_TOKEN"
```

### Create Your First Agent

```javascript
import axios from 'axios';

const createAgent = async () => {
  const response = await axios.post(
    'http://localhost:3001/api/agents',
    {
      name: "My First Agent",
      description: "A simple automation agent",
      category: "automation",
      code: `
        async function execute(input, context) {
          return { 
            success: true, 
            data: { message: "Hello from my agent!" }
          };
        }
      `
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.CORTEXBUILD_TOKEN}`,
        'Content-Type': 'application/json'
      }
    }
  );

  console.log('Agent created:', response.data.agentId);
};
```

### Register Your First Webhook

```javascript
const registerWebhook = async () => {
  const response = await axios.post(
    'http://localhost:3001/api/webhooks',
    {
      url: 'https://your-domain.com/webhooks/cortexbuild',
      events: ['task.completed', 'project.created']
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.CORTEXBUILD_TOKEN}`,
        'Content-Type': 'application/json'
      }
    }
  );

  console.log('Webhook registered:', response.data.webhookId);
  console.log('Secret:', response.data.secret);
};
```

## 📖 Documentation Overview

### API Agents Documentation

**What's Included:**

- Complete API reference for 8 endpoints
- Request/response examples
- Authentication requirements
- Error codes and handling
- Agent categories and status flow
- Rate limits

**Best For:**

- API integration
- Building agent marketplaces
- Programmatic agent management

### AI Agent Developer Guide

**What's Included:**

- Agent architecture explained
- Input/output formats
- 6 agent categories with use cases
- Local and integration testing
- Publishing checklist
- Best practices (error handling, security, performance)
- 3 complete example implementations:
  - RFI Auto-Responder
  - Budget Forecaster
  - Safety Incident Predictor

**Best For:**

- First-time agent developers
- Understanding agent execution model
- Learning best practices
- Example code to get started

### Webhook Integration Guide

**What's Included:**

- Webhook registration
- 20+ event types
- HMAC signature verification
- Retry logic and handling
- Testing with ngrok
- Code examples in 5 languages
- Troubleshooting guide

**Best For:**

- Real-time integrations
- Event-driven architectures
- Building third-party apps
- Syncing with external systems

## 🔑 Key Concepts

### AI Agents

**What are they?**
AI Agents are autonomous JavaScript functions that automate tasks, analyze data, and integrate services.

**How do they work?**

1. User triggers agent with input
2. Agent executes in secure sandbox
3. Agent processes data and returns output
4. Results stored and returned to user

**Categories:**

- **Automation**: RFI responses, report generation
- **Analytics**: Budget forecasting, trend analysis
- **Safety**: Incident prediction, compliance checks
- **Financial**: Invoice processing, expense tracking
- **Communication**: Email automation, notifications
- **Integration**: QuickBooks sync, API connectors

### Webhooks

**What are they?**
HTTP callbacks that notify your app when events occur in CortexBuild.

**Why use them?**

- Real-time notifications
- No polling required
- Efficient and scalable
- Built-in retry logic

**Common Events:**

- `project.created`, `project.completed`
- `task.completed`, `task.overdue`
- `invoice.paid`, `expense.approved`
- `incident.reported`, `safety.violation`

### Authentication

All API requests require JWT authentication:

```javascript
headers: {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
}
```

Token obtained from login:

```bash
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "password123"
}
```

## 🛠️ Development Tools

### API Testing

**cURL**

```bash
# Browse marketplace
curl http://localhost:3001/api/agents/marketplace \
  -H "Authorization: Bearer $TOKEN"

# Create agent
curl -X POST http://localhost:3001/api/agents \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d @agent.json
```

**Postman/Insomnia**

- Import OpenAPI spec (coming soon)
- Set environment variable for token
- Test all endpoints visually

### Webhook Testing

**ngrok** - Expose local server

```bash
ngrok http 3000
# Use https://abc123.ngrok.io as webhook URL
```

**Webhook Inspectors**

- RequestBin: <https://requestbin.com>
- Webhook.site: <https://webhook.site>
- Beeceptor: <https://beeceptor.com>

### Local Development

```bash
# Clone repository
git clone https://github.com/cortexbuild/platform.git
cd platform

# Install dependencies
npm install

# Start development servers
npm run dev:all

# Frontend: http://localhost:3000
# Backend API: http://localhost:3001
# WebSocket: ws://localhost:3001/ws
```

## 📦 SDK Libraries (Coming Soon)

### Official SDKs

**JavaScript/TypeScript**

```bash
npm install @cortexbuild/sdk
```

```javascript
import { CortexBuild } from '@cortexbuild/sdk';

const client = new CortexBuild({ token: 'your-jwt-token' });

// Get agents
const agents = await client.agents.list({ category: 'automation' });

// Execute agent
const result = await client.agents.execute('agent-123', { 
  input: { action: 'analyze', data: { ... } }
});
```

**Python**

```bash
pip install cortexbuild
```

```python
from cortexbuild import CortexBuild

client = CortexBuild(token='your-jwt-token')

# Get agents
agents = client.agents.list(category='automation')

# Execute agent
result = client.agents.execute('agent-123', {
    'input': {'action': 'analyze', 'data': {...}}
})
```

## 🔒 Security Best Practices

### API Keys & Tokens

- **Never commit tokens** to version control
- **Use environment variables** for secrets
- **Rotate tokens regularly** (every 90 days)
- **Set expiration times** appropriately

### Webhook Security

- **Always verify signatures** using HMAC-SHA256
- **Use HTTPS endpoints** in production
- **Validate payloads** before processing
- **Rate limit endpoints** to prevent abuse

### Agent Security

- **Validate all inputs** before processing
- **Never use eval()** with user input
- **Sanitize HTML/SQL** to prevent injection
- **Limit execution time** (60s max)

## 📊 Rate Limits

| Resource | Limit | Window |
|----------|-------|--------|
| Agent Marketplace Browse | 100 requests | 1 minute |
| Agent Execution | 50 executions | 1 hour |
| Subscription Management | 20 requests | 1 minute |
| Webhook Registrations | 10 requests | 1 minute |

**Rate Limit Headers:**

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1699545600
```

## ❓ FAQ

### How do I become a developer?

1. Log in to CortexBuild
2. Navigate to Settings → Account
3. Request developer access
4. Wait for approval (usually < 24 hours)

### Can I sell my agents?

Yes! Set a price when creating your agent:

```javascript
{
  "name": "My Premium Agent",
  "price": 49.99,  // USD per month
  "isPublic": true
}
```

### How do webhooks retry?

Failed webhooks retry 5 times with exponential backoff:

- Attempt 1: Immediate
- Attempt 2: 1 minute
- Attempt 3: 5 minutes
- Attempt 4: 15 minutes
- Attempt 5: 1 hour

After 10 consecutive failures, webhook is disabled.

### What's the execution timeout?

Agents must complete within **60 seconds**. If execution exceeds this, it will be terminated and marked as failed.

### Can agents access external APIs?

Yes, but only approved APIs. Contact support to whitelist external services.

## 🆘 Support

### Documentation

- **API Reference**: [API_AGENTS_DOCUMENTATION.md](./API_AGENTS_DOCUMENTATION.md)
- **Developer Guide**: [AI_AGENT_DEVELOPER_GUIDE.md](./AI_AGENT_DEVELOPER_GUIDE.md)
- **Webhook Guide**: [WEBHOOK_INTEGRATION_GUIDE.md](./WEBHOOK_INTEGRATION_GUIDE.md)

### Contact

- **Email**: <dev@cortexbuild.com>
- **Discord**: <https://discord.gg/cortexbuild>
- **GitHub**: <https://github.com/cortexbuild/platform>
- **Issues**: <https://github.com/cortexbuild/platform/issues>

### Status

- **API Status**: <https://status.cortexbuild.com>
- **Incident Reports**: <https://status.cortexbuild.com/incidents>

## 📝 Changelog

### Version 1.0.0 (2025-11-09)

- Initial release
- AI Agents API (8 endpoints)
- Webhook system (20+ events)
- HMAC signature verification
- Automatic retries
- Developer portal

## 📄 License

MIT License - see LICENSE file for details

---

**Built with ❤️ by the CortexBuild Team**

Ready to build? Start with the [AI Agent Developer Guide](./AI_AGENT_DEVELOPER_GUIDE.md)!
