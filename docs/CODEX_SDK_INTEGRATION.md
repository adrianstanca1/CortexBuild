# OpenAI Codex SDK Integration

## 📚 Overview

CortexBuild integrates **OpenAI Codex SDK** (GA October 2025) to provide AI-powered coding assistance directly in the Developer Dashboard.

**Codex Agent** is powered by **GPT-5-Codex**, the latest model optimized for code generation, exploration, and review.

---

## 🎯 Features

### 1. **Codex Agent Chat Interface**
- Interactive chat with GPT-5-Codex
- Thread-based conversations
- Context-aware responses
- Real-time code generation

### 2. **Thread Management**
- Create new threads
- Resume existing threads
- Persistent conversation history
- Context preservation

### 3. **Code Operations**
- **Explore**: Analyze repositories and codebases
- **Propose**: Suggest improvements and changes
- **Implement**: Generate code and files
- **Review**: Code review and quality checks
- **Test**: Run and verify tests

### 4. **File Management**
- Track file changes
- Preview generated code
- View diff statistics (added/removed/modified lines)
- Multi-file operations

### 5. **Supabase Persistence**
- All threads stored in PostgreSQL
- Message history preserved
- Execution tracking
- File change history

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Developer Dashboard V2                    │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                    Codex Agent UI                     │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │         Chat Interface (CodexAgent.tsx)         │  │  │
│  │  │  • User input                                   │  │  │
│  │  │  • Message history                              │  │  │
│  │  │  • Code preview                                 │  │  │
│  │  │  • File changes                                 │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  │                          ↓                            │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │         Codex SDK (codex-sdk.ts)                │  │  │
│  │  │  • Thread management                            │  │  │
│  │  │  • Command execution                            │  │  │
│  │  │  • Intent parsing                               │  │  │
│  │  │  • Result formatting                            │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  │                          ↓                            │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │         Supabase PostgreSQL                     │  │  │
│  │  │  • codex_threads                                │  │  │
│  │  │  • codex_messages                               │  │  │
│  │  │  • codex_executions                             │  │  │
│  │  │  • codex_files                                  │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 📦 Database Schema

### **codex_threads**
```sql
CREATE TABLE codex_threads (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    context JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### **codex_messages**
```sql
CREATE TABLE codex_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    thread_id TEXT NOT NULL REFERENCES codex_threads(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    metadata JSONB,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);
```

### **codex_executions**
```sql
CREATE TABLE codex_executions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    thread_id TEXT NOT NULL REFERENCES codex_threads(id) ON DELETE CASCADE,
    command TEXT NOT NULL,
    result JSONB,
    success BOOLEAN DEFAULT false,
    duration_ms INTEGER,
    executed_at TIMESTAMPTZ DEFAULT NOW()
);
```

### **codex_files**
```sql
CREATE TABLE codex_files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    execution_id UUID NOT NULL REFERENCES codex_executions(id) ON DELETE CASCADE,
    file_path TEXT NOT NULL,
    content TEXT,
    language TEXT,
    changes JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 🚀 Usage

### **1. Access Codex Agent**

From Developer Dashboard V2:
1. Click on **"Codex Agent"** tool card
2. Codex Agent modal opens
3. Start chatting with GPT-5-Codex

### **2. Quick Actions**

Pre-defined commands for common tasks:
- **"Explore repo"** - Analyze repository structure
- **"Propose changes"** - Suggest improvements
- **"Review code"** - Code quality review
- **"Run tests"** - Execute test suite

### **3. Custom Commands**

Type any command in natural language:
```
"Create a new React component for user authentication"
"Review the latest changes in auth/authService.ts"
"Propose improvements for the database schema"
"Run all unit tests and show results"
```

### **4. Code Preview**

When Codex generates code, it's displayed in a syntax-highlighted preview:
```typescript
// Example generated code
import { CodexSDK } from '@/lib/integrations/codex-sdk';

const agent = new CodexSDK();
const thread = await agent.startThread();
```

### **5. File Changes**

View file modifications with diff statistics:
```
lib/integrations/codex-sdk.ts
  +250 lines added
  -0 lines removed
  ~0 lines modified
```

---

## 🔧 API Reference

### **CodexSDK Class**

```typescript
import { CodexSDK } from '@/lib/integrations/codex-sdk';

const codex = new CodexSDK({
  apiKey: 'your-api-key',
  model: 'gpt-5-codex',
  temperature: 0.7,
  maxTokens: 4000,
});
```

### **Methods**

#### `startThread(context?: Record<string, any>): Promise<CodexThread>`
Start a new conversation thread.

```typescript
const thread = await codex.startThread({
  userId: 'user-123',
  projectId: 'project-456',
});
```

#### `run(threadId: string, command: string, options?: any): Promise<CodexResult>`
Execute a command in a thread.

```typescript
const result = await codex.run(thread.id, 'Explore this repository');
```

#### `resumeThread(threadId: string): Promise<CodexThread | null>`
Resume an existing thread.

```typescript
const thread = await codex.resumeThread('thread_123');
```

#### `getThreadHistory(threadId: string): CodexMessage[]`
Get all messages in a thread.

```typescript
const messages = codex.getThreadHistory(thread.id);
```

#### `clearThread(threadId: string): Promise<void>`
Delete a thread and all its messages.

```typescript
await codex.clearThread(thread.id);
```

---

## 📊 Types

### **CodexThread**
```typescript
interface CodexThread {
  id: string;
  createdAt: Date;
  messages: CodexMessage[];
  context: Record<string, any>;
}
```

### **CodexMessage**
```typescript
interface CodexMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}
```

### **CodexResult**
```typescript
interface CodexResult {
  success: boolean;
  output: string;
  code?: string;
  files?: CodexFile[];
  metadata?: Record<string, any>;
  error?: string;
}
```

### **CodexFile**
```typescript
interface CodexFile {
  path: string;
  content: string;
  language: string;
  changes?: {
    added: number;
    removed: number;
    modified: number;
  };
}
```

---

## 🎨 UI Components

### **CodexAgent Component**

```tsx
import CodexAgent from '@/components/CodexAgent';

<CodexAgent
  projectId={currentUser.company_id}
  initialContext={{
    userId: currentUser.id,
    userName: currentUser.name,
  }}
  onResult={(result) => {
    if (result.success) {
      toast.success('Task completed!');
    }
  }}
/>
```

---

## 🔐 Environment Variables

```bash
# OpenAI Codex API Key (future production use)
VITE_CODEX_API_KEY=your-codex-api-key

# Supabase (for persistence)
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

---

## 📝 Example Workflows

### **1. Explore Repository**
```
User: "Explore this repository"
Codex: "📊 Repository Analysis:
        ✅ Found 50+ files
        ✅ Identified 3 main modules
        ✅ Detected TypeScript/React stack
        Ready to propose changes!"
```

### **2. Propose Changes**
```
User: "Propose improvements"
Codex: "💡 Proposed Changes:
        1. Add Codex SDK integration
        2. Create CodexAgent component
        3. Update API routes
        Ready to implement?"
```

### **3. Implement Feature**
```
User: "Implement the changes"
Codex: "✅ Implementation Complete!
        Created 3 files:
        - lib/integrations/codex-sdk.ts
        - components/CodexAgent.tsx
        - api/codex/route.ts"
```

---

## 🚀 Future Enhancements

- [ ] Real OpenAI API integration (currently simulated)
- [ ] Slack integration (@Codex in Slack)
- [ ] GitHub Actions integration
- [ ] Admin dashboard for usage analytics
- [ ] Multi-language support
- [ ] Custom model fine-tuning
- [ ] Team collaboration features

---

## 📚 Resources

- **OpenAI Codex GA Announcement**: https://openai.com/index/codex-now-generally-available/
- **Codex SDK Documentation**: https://platform.openai.com/docs/codex
- **GPT-5-Codex Model**: Latest code-optimized model
- **CortexBuild Docs**: `/docs/PLATFORM_ARCHITECTURE.md`

---

**🎉 Codex Agent is now integrated into CortexBuild Developer Dashboard!**

