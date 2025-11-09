# AI Agent Developer Guide

Complete guide for building, testing, and publishing AI agents on the CortexBuild platform.

## Table of Contents

1. [Introduction](#introduction)
2. [Agent Architecture](#agent-architecture)
3. [Getting Started](#getting-started)
4. [Creating Your First Agent](#creating-your-first-agent)
5. [Agent Categories](#agent-categories)
6. [Input/Output Format](#inputoutput-format)
7. [Testing Agents](#testing-agents)
8. [Publishing to Marketplace](#publishing-to-marketplace)
9. [Best Practices](#best-practices)
10. [Example Agents](#example-agents)

---

## Introduction

AI Agents are autonomous JavaScript functions that can:

- Automate repetitive tasks
- Analyze data and provide insights
- Integrate with external services
- Process documents and generate reports
- Monitor safety and compliance
- Manage financial operations

Agents run in a secure sandbox environment and have access to the CortexBuild API and select external APIs.

---

## Agent Architecture

### Agent Structure

Every agent consists of:

```javascript
{
  "name": "Agent Name",
  "description": "What the agent does",
  "category": "automation|analytics|safety|financial|communication|integration",
  "version": "1.0.0",
  "config": {
    // Agent configuration
  },
  "code": "// Agent implementation"
}
```

### Execution Model

1. User triggers agent with input data
2. Agent code executes in sandbox environment
3. Agent processes data and returns output
4. Results stored and returned to user

**Execution Timeout:** 60 seconds per run

---

## Getting Started

### Prerequisites

1. **Developer Account**: Upgrade to Developer role
2. **API Access**: Obtain JWT token for authentication
3. **Development Environment**: Node.js 18+ for local testing

### Authentication

All API calls require authentication:

```typescript
const token = 'your_jwt_token';
const headers = {
  Authorization: `Bearer ${token}`,
  'Content-Type': 'application/json'
};
```

---

## Creating Your First Agent

### Step 1: Define Agent Metadata

```typescript
const agentMetadata = {
  name: "Task Priority Analyzer",
  description: "Analyzes tasks and assigns priority scores based on urgency, budget impact, and dependencies",
  category: "analytics",
  version: "1.0.0",
  config: {
    urgencyWeight: 0.4,
    budgetWeight: 0.3,
    dependencyWeight: 0.3
  }
};
```

### Step 2: Write Agent Code

```javascript
async function execute(input, context) {
  // Extract input data
  const { tasks } = input.data;
  
  // Get configuration
  const config = context.config;
  
  // Process tasks
  const analyzed = tasks.map(task => {
    const urgencyScore = calculateUrgency(task) * config.urgencyWeight;
    const budgetScore = calculateBudgetImpact(task) * config.budgetWeight;
    const dependencyScore = calculateDependencies(task) * config.dependencyWeight;
    
    const priorityScore = urgencyScore + budgetScore + dependencyScore;
    
    return {
      taskId: task.id,
      taskName: task.name,
      priorityScore: Math.round(priorityScore * 100) / 100,
      urgencyScore,
      budgetScore,
      dependencyScore,
      recommendation: priorityScore > 0.7 ? 'High Priority' : 
                     priorityScore > 0.4 ? 'Medium Priority' : 'Low Priority'
    };
  });
  
  // Sort by priority score
  analyzed.sort((a, b) => b.priorityScore - a.priorityScore);
  
  // Return results
  return {
    success: true,
    analyzedTasks: analyzed,
    summary: {
      totalTasks: tasks.length,
      highPriority: analyzed.filter(t => t.priorityScore > 0.7).length,
      mediumPriority: analyzed.filter(t => t.priorityScore > 0.4 && t.priorityScore <= 0.7).length,
      lowPriority: analyzed.filter(t => t.priorityScore <= 0.4).length
    }
  };
}

function calculateUrgency(task) {
  if (!task.dueDate) return 0.3;
  
  const daysUntilDue = (new Date(task.dueDate) - new Date()) / (1000 * 60 * 60 * 24);
  
  if (daysUntilDue < 0) return 1.0; // Overdue
  if (daysUntilDue <= 1) return 0.9;
  if (daysUntilDue <= 3) return 0.7;
  if (daysUntilDue <= 7) return 0.5;
  return 0.3;
}

function calculateBudgetImpact(task) {
  const budgetImpact = task.estimatedCost || 0;
  
  if (budgetImpact > 50000) return 1.0;
  if (budgetImpact > 20000) return 0.7;
  if (budgetImpact > 5000) return 0.5;
  return 0.3;
}

function calculateDependencies(task) {
  const blockedTasks = task.blockedTasks || [];
  
  if (blockedTasks.length >= 5) return 1.0;
  if (blockedTasks.length >= 3) return 0.7;
  if (blockedTasks.length >= 1) return 0.5;
  return 0.2;
}
```

### Step 3: Create Agent via API

```typescript
import axios from 'axios';

const createAgent = async () => {
  const response = await axios.post(
    'http://localhost:3001/api/agents',
    {
      name: agentMetadata.name,
      description: agentMetadata.description,
      category: agentMetadata.category,
      config: agentMetadata.config,
      code: `
        ${execute.toString()}
        ${calculateUrgency.toString()}
        ${calculateBudgetImpact.toString()}
        ${calculateDependencies.toString()}
      `,
      isPublic: false,
      price: 0
    },
    { headers }
  );
  
  console.log('Agent created:', response.data.agentId);
  return response.data.agentId;
};
```

### Step 4: Test Agent

```typescript
const testAgent = async (agentId) => {
  // Execute agent with test data
  const execution = await axios.post(
    `http://localhost:3001/api/agents/${agentId}/execute`,
    {
      input: {
        action: 'analyze',
        data: {
          tasks: [
            {
              id: 'task-1',
              name: 'Fix critical roof leak',
              dueDate: '2025-11-10',
              estimatedCost: 15000,
              blockedTasks: ['task-2', 'task-3']
            },
            {
              id: 'task-2',
              name: 'Paint exterior walls',
              dueDate: '2025-11-20',
              estimatedCost: 3000,
              blockedTasks: []
            }
          ]
        }
      }
    },
    { headers }
  );
  
  const executionId = execution.data.executionId;
  
  // Poll for results
  let status = 'running';
  while (status === 'running' || status === 'pending') {
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const result = await axios.get(
      `http://localhost:3001/api/agents/executions/${executionId}`,
      { headers }
    );
    
    status = result.data.execution.status;
    
    if (status === 'completed') {
      console.log('Results:', result.data.execution.output);
    } else if (status === 'failed') {
      console.error('Error:', result.data.execution.errorMessage);
    }
  }
};
```

### Step 5: Publish to Marketplace

```typescript
const publishAgent = async (agentId) => {
  await axios.post(
    `http://localhost:3001/api/agents/${agentId}/publish`,
    {},
    { headers }
  );
  
  console.log('Agent published to marketplace!');
};
```

---

## Agent Categories

### 1. Automation

**Purpose:** Automate repetitive workflows

**Examples:**

- RFI Auto-Responder
- Daily Report Generator
- Task Reminder System
- Document Approval Workflow

**Input Format:**

```javascript
{
  action: 'automate',
  data: {
    workflowType: 'rfi_response',
    params: { ... }
  }
}
```

### 2. Analytics

**Purpose:** Data analysis and insights

**Examples:**

- Budget Forecaster
- Performance Dashboard
- Trend Analyzer
- Predictive Analytics

**Input Format:**

```javascript
{
  action: 'analyze',
  data: {
    analysisType: 'budget_forecast',
    timeRange: { from: '2025-01-01', to: '2025-12-31' },
    params: { ... }
  }
}
```

### 3. Safety

**Purpose:** Safety monitoring and compliance

**Examples:**

- Incident Risk Predictor
- Compliance Checker
- Safety Report Analyzer
- Hazard Detection

**Input Format:**

```javascript
{
  action: 'assess',
  data: {
    assessmentType: 'incident_risk',
    projectId: 'proj-123',
    params: { ... }
  }
}
```

### 4. Financial

**Purpose:** Financial operations and tracking

**Examples:**

- Invoice Processor
- Expense Analyzer
- Budget Tracker
- Cost Overrun Detector

**Input Format:**

```javascript
{
  action: 'process',
  data: {
    operationType: 'invoice_processing',
    invoices: [...],
    params: { ... }
  }
}
```

### 5. Communication

**Purpose:** Communication and notifications

**Examples:**

- Email Automation
- Slack Integration
- SMS Alerts
- Team Notifications

**Input Format:**

```javascript
{
  action: 'send',
  data: {
    messageType: 'email',
    recipients: [...],
    content: { ... }
  }
}
```

### 6. Integration

**Purpose:** Third-party service integrations

**Examples:**

- QuickBooks Sync
- Google Calendar Integration
- Dropbox File Sync
- API Connector

**Input Format:**

```javascript
{
  action: 'sync',
  data: {
    service: 'quickbooks',
    operation: 'sync_invoices',
    params: { ... }
  }
}
```

---

## Input/Output Format

### Standard Input Structure

```javascript
{
  action: 'string',      // Action type (analyze, process, sync, etc.)
  data: {                // Input data object
    // Action-specific data
  }
}
```

### Standard Output Structure

```javascript
{
  success: boolean,      // Execution success status
  data: {                // Result data
    // Action-specific results
  },
  errors: [],            // Optional: array of errors
  warnings: [],          // Optional: array of warnings
  metadata: {            // Optional: execution metadata
    duration: 1234,      // Execution time in ms
    timestamp: '...',    // ISO timestamp
    version: '1.0.0'     // Agent version
  }
}
```

### Context Object

Agents receive a context object with:

```javascript
{
  config: {              // Agent configuration
    // Custom config values
  },
  user: {                // Executing user info
    id: 'user-123',
    companyId: 'comp-1',
    role: 'Project Manager'
  },
  api: {                 // API helpers
    get: async (url) => { ... },
    post: async (url, data) => { ... }
  }
}
```

---

## Testing Agents

### Local Testing

```javascript
// test-agent.js
const agentCode = `
  async function execute(input, context) {
    // Agent implementation
    return { success: true, data: { result: 'test' } };
  }
`;

// Create function from code
const agentFunction = new Function('input', 'context', agentCode + '\nreturn execute(input, context);');

// Test with sample data
const testInput = {
  action: 'test',
  data: { sample: 'data' }
};

const testContext = {
  config: { setting: 'value' },
  user: { id: 'test-user', companyId: 'test-company' }
};

agentFunction(testInput, testContext)
  .then(output => console.log('Output:', output))
  .catch(error => console.error('Error:', error));
```

### Unit Testing

```javascript
// agent.test.js
import { describe, it, expect } from 'vitest';

describe('Task Priority Analyzer', () => {
  it('should calculate high priority for overdue tasks', () => {
    const task = {
      id: 'task-1',
      name: 'Critical fix',
      dueDate: '2025-11-01', // Past date
      estimatedCost: 25000,
      blockedTasks: ['task-2', 'task-3', 'task-4']
    };
    
    const urgency = calculateUrgency(task);
    expect(urgency).toBe(1.0);
  });
  
  it('should calculate budget impact correctly', () => {
    const highCostTask = { estimatedCost: 60000 };
    expect(calculateBudgetImpact(highCostTask)).toBe(1.0);
    
    const lowCostTask = { estimatedCost: 2000 };
    expect(calculateBudgetImpact(lowCostTask)).toBe(0.3);
  });
});
```

### Integration Testing

```javascript
// integration-test.js
import axios from 'axios';

const runIntegrationTest = async () => {
  // 1. Create agent
  const createResponse = await axios.post('/api/agents', agentData, { headers });
  const agentId = createResponse.data.agentId;
  
  // 2. Execute with test data
  const execResponse = await axios.post(`/api/agents/${agentId}/execute`, {
    input: testInput
  }, { headers });
  
  const executionId = execResponse.data.executionId;
  
  // 3. Wait for completion
  let result;
  let attempts = 0;
  while (attempts < 30) {
    result = await axios.get(`/api/agents/executions/${executionId}`, { headers });
    
    if (result.data.execution.status === 'completed') {
      console.log('✅ Test passed:', result.data.execution.output);
      break;
    } else if (result.data.execution.status === 'failed') {
      console.error('❌ Test failed:', result.data.execution.errorMessage);
      break;
    }
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    attempts++;
  }
};
```

---

## Publishing to Marketplace

### Pre-Publishing Checklist

- [ ] Agent tested with multiple input scenarios
- [ ] Error handling implemented
- [ ] Input validation added
- [ ] Documentation complete
- [ ] Pricing determined (if commercial)
- [ ] Agent description is clear and accurate
- [ ] Category is appropriate

### Publishing Process

```typescript
// 1. Update agent to public
await axios.put(`/api/agents/${agentId}`, {
  isPublic: true,
  price: 29.99  // Set price or 0 for free
}, { headers });

// 2. Publish to marketplace
await axios.post(`/api/agents/${agentId}/publish`, {}, { headers });

console.log('Agent is now live in marketplace!');
```

### Marketplace Guidelines

**Required Information:**

- Clear, descriptive name (3-100 characters)
- Detailed description (10-500 characters)
- Appropriate category
- Version number (semantic versioning)

**Recommendations:**

- Provide usage examples in description
- Set reasonable pricing
- Include expected execution time
- List any required permissions
- Mention external API dependencies

**Prohibited:**

- Malicious code
- Data harvesting
- Unauthorized external API calls
- Copyright violations
- Misleading descriptions

---

## Best Practices

### 1. Error Handling

```javascript
async function execute(input, context) {
  try {
    // Validate input
    if (!input.data || !input.data.tasks) {
      return {
        success: false,
        errors: ['Missing required field: data.tasks']
      };
    }
    
    // Process data
    const result = processData(input.data);
    
    return {
      success: true,
      data: result
    };
  } catch (error) {
    return {
      success: false,
      errors: [error.message],
      metadata: {
        errorType: error.name,
        stack: error.stack.split('\n').slice(0, 3).join('\n')
      }
    };
  }
}
```

### 2. Input Validation

```javascript
function validateInput(input) {
  const errors = [];
  
  if (!input.action) {
    errors.push('Missing required field: action');
  }
  
  if (!input.data) {
    errors.push('Missing required field: data');
  }
  
  if (input.action === 'analyze' && !input.data.tasks) {
    errors.push('Missing required field: data.tasks for analyze action');
  }
  
  if (errors.length > 0) {
    return { valid: false, errors };
  }
  
  return { valid: true };
}
```

### 3. Configuration Management

```javascript
async function execute(input, context) {
  // Get config with defaults
  const config = {
    maxItems: context.config.maxItems || 100,
    timeout: context.config.timeout || 30000,
    retryAttempts: context.config.retryAttempts || 3
  };
  
  // Use configuration
  const items = input.data.items.slice(0, config.maxItems);
  
  // Process with retry logic
  let attempts = 0;
  while (attempts < config.retryAttempts) {
    try {
      return await processItems(items);
    } catch (error) {
      attempts++;
      if (attempts >= config.retryAttempts) throw error;
      await sleep(1000 * attempts); // Exponential backoff
    }
  }
}
```

### 4. Performance Optimization

```javascript
// ✅ DO: Process in batches
async function processTasks(tasks) {
  const batchSize = 10;
  const results = [];
  
  for (let i = 0; i < tasks.length; i += batchSize) {
    const batch = tasks.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(processTask));
    results.push(...batchResults);
  }
  
  return results;
}

// ❌ DON'T: Process sequentially
async function processTasksSlow(tasks) {
  const results = [];
  for (const task of tasks) {
    results.push(await processTask(task)); // Slow!
  }
  return results;
}
```

### 5. Security

```javascript
// ✅ DO: Sanitize user input
function sanitizeInput(input) {
  if (typeof input === 'string') {
    return input
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }
  return input;
}

// ❌ DON'T: Use eval() or Function constructor with user input
// NEVER DO THIS:
eval(userInput); // Security vulnerability!
```

### 6. Logging

```javascript
async function execute(input, context) {
  const startTime = Date.now();
  
  console.log('[Agent] Starting execution:', {
    action: input.action,
    timestamp: new Date().toISOString()
  });
  
  try {
    const result = await processData(input.data);
    
    console.log('[Agent] Execution completed:', {
      duration: Date.now() - startTime,
      itemsProcessed: result.count
    });
    
    return { success: true, data: result };
  } catch (error) {
    console.error('[Agent] Execution failed:', {
      error: error.message,
      duration: Date.now() - startTime
    });
    
    return { success: false, errors: [error.message] };
  }
}
```

---

## Example Agents

### Example 1: RFI Auto-Responder

```javascript
async function execute(input, context) {
  const { rfiId, projectId } = input.data;
  
  // Fetch RFI details
  const rfi = await context.api.get(`/api/rfis/${rfiId}`);
  
  // Analyze RFI content
  const analysis = {
    subject: rfi.subject,
    question: rfi.question,
    urgency: calculateUrgency(rfi),
    requiredInfo: extractRequiredInfo(rfi.description),
    suggestedResponse: await generateResponse(rfi, context)
  };
  
  return {
    success: true,
    data: {
      rfiId,
      analysis,
      confidence: 0.85
    }
  };
}

function calculateUrgency(rfi) {
  const daysUntilDue = (new Date(rfi.dueDate) - new Date()) / (1000 * 60 * 60 * 24);
  
  if (daysUntilDue <= 1) return 'critical';
  if (daysUntilDue <= 3) return 'high';
  if (daysUntilDue <= 7) return 'medium';
  return 'low';
}

function extractRequiredInfo(description) {
  const keywords = ['dimension', 'specification', 'material', 'quantity', 'deadline'];
  const found = [];
  
  keywords.forEach(keyword => {
    if (description.toLowerCase().includes(keyword)) {
      found.push(keyword);
    }
  });
  
  return found;
}

async function generateResponse(rfi, context) {
  // Use AI to generate response draft
  const prompt = `
    Generate a professional response to this RFI:
    Subject: ${rfi.subject}
    Question: ${rfi.question}
    Context: ${rfi.description}
  `;
  
  // Call AI service (simplified)
  return `Thank you for your inquiry regarding ${rfi.subject}. 
          Based on project specifications, we can provide the following information...`;
}
```

### Example 2: Budget Forecaster

```javascript
async function execute(input, context) {
  const { projectId, forecastMonths } = input.data;
  
  // Fetch historical data
  const expenses = await context.api.get(`/api/projects/${projectId}/expenses`);
  const budget = await context.api.get(`/api/projects/${projectId}/budget`);
  
  // Calculate trends
  const monthlyExpenses = groupByMonth(expenses);
  const avgMonthlySpend = calculateAverage(monthlyExpenses);
  const trend = calculateTrend(monthlyExpenses);
  
  // Generate forecast
  const forecast = [];
  for (let i = 1; i <= forecastMonths; i++) {
    const projectedSpend = avgMonthlySpend * (1 + (trend * i));
    forecast.push({
      month: i,
      projected: Math.round(projectedSpend),
      confidence: calculateConfidence(monthlyExpenses.length, i)
    });
  }
  
  // Calculate totals
  const totalProjected = forecast.reduce((sum, m) => sum + m.projected, 0);
  const remainingBudget = budget.total - budget.spent;
  
  return {
    success: true,
    data: {
      currentBudget: {
        total: budget.total,
        spent: budget.spent,
        remaining: remainingBudget,
        percentUsed: Math.round((budget.spent / budget.total) * 100)
      },
      forecast,
      projectedTotal: totalProjected,
      overrunRisk: totalProjected > remainingBudget ? 'high' : 'low',
      recommendations: generateRecommendations(totalProjected, remainingBudget)
    }
  };
}

function groupByMonth(expenses) {
  const grouped = {};
  expenses.forEach(expense => {
    const month = expense.date.substring(0, 7); // YYYY-MM
    grouped[month] = (grouped[month] || 0) + expense.amount;
  });
  return Object.values(grouped);
}

function calculateAverage(values) {
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

function calculateTrend(values) {
  if (values.length < 2) return 0;
  
  const recent = values.slice(-3);
  const earlier = values.slice(-6, -3);
  
  const recentAvg = calculateAverage(recent);
  const earlierAvg = calculateAverage(earlier);
  
  return (recentAvg - earlierAvg) / earlierAvg;
}

function calculateConfidence(dataPoints, monthsAhead) {
  const baseConfidence = Math.min(dataPoints / 12, 1); // More data = higher confidence
  const decayFactor = Math.pow(0.9, monthsAhead - 1); // Confidence decreases over time
  return Math.round(baseConfidence * decayFactor * 100);
}

function generateRecommendations(projected, remaining) {
  const recommendations = [];
  
  if (projected > remaining) {
    recommendations.push('Budget overrun likely - review expenses and adjust forecast');
    recommendations.push('Consider cost reduction measures');
  }
  
  if (projected > remaining * 1.2) {
    recommendations.push('Critical: Projected spending exceeds budget by 20%+');
    recommendations.push('Immediate action required - escalate to management');
  }
  
  return recommendations;
}
```

### Example 3: Safety Incident Predictor

```javascript
async function execute(input, context) {
  const { projectId, analysisDays } = input.data;
  
  // Fetch historical incidents
  const incidents = await context.api.get(`/api/projects/${projectId}/incidents`);
  const weather = await context.api.get(`/api/weather/${projectId}/forecast`);
  const workforce = await context.api.get(`/api/projects/${projectId}/workforce`);
  
  // Calculate risk factors
  const riskFactors = {
    incidentRate: calculateIncidentRate(incidents, analysisDays),
    weatherRisk: assessWeatherRisk(weather),
    workforceRisk: assessWorkforceRisk(workforce),
    timeRisk: assessTimeRisk()
  };
  
  // Calculate overall risk score
  const riskScore = (
    riskFactors.incidentRate * 0.4 +
    riskFactors.weatherRisk * 0.2 +
    riskFactors.workforceRisk * 0.2 +
    riskFactors.timeRisk * 0.2
  );
  
  // Generate predictions
  const predictions = generatePredictions(incidents, riskScore);
  
  return {
    success: true,
    data: {
      riskScore: Math.round(riskScore * 100) / 100,
      riskLevel: riskScore > 0.7 ? 'high' : riskScore > 0.4 ? 'medium' : 'low',
      riskFactors,
      predictions,
      recommendations: generateSafetyRecommendations(riskScore, riskFactors)
    }
  };
}

function calculateIncidentRate(incidents, days) {
  const recentIncidents = incidents.filter(i => {
    const daysAgo = (Date.now() - new Date(i.date).getTime()) / (1000 * 60 * 60 * 24);
    return daysAgo <= days;
  });
  
  return Math.min(recentIncidents.length / days, 1);
}

function assessWeatherRisk(weather) {
  const hazardousConditions = ['rain', 'snow', 'wind', 'extreme_heat'];
  const hasHazard = weather.forecast.some(day => 
    hazardousConditions.includes(day.condition)
  );
  
  return hasHazard ? 0.7 : 0.3;
}

function assessWorkforceRisk(workforce) {
  const inexperiencedRatio = workforce.workers.filter(w => 
    w.experienceMonths < 12
  ).length / workforce.workers.length;
  
  return inexperiencedRatio;
}

function assessTimeRisk() {
  const hour = new Date().getHours();
  // Higher risk during rush periods (morning/afternoon)
  if (hour >= 7 && hour <= 9) return 0.7;
  if (hour >= 16 && hour <= 18) return 0.7;
  return 0.3;
}

function generatePredictions(incidents, riskScore) {
  const incidentTypes = ['fall', 'equipment', 'struck_by', 'electrical'];
  
  return incidentTypes.map(type => {
    const historicalRate = incidents.filter(i => i.type === type).length / incidents.length;
    const probability = Math.min(historicalRate * riskScore * 1.5, 0.95);
    
    return {
      type,
      probability: Math.round(probability * 100),
      severity: probability > 0.5 ? 'high' : 'medium',
      preventionMeasures: getPreventionMeasures(type)
    };
  });
}

function generateSafetyRecommendations(riskScore, factors) {
  const recommendations = [];
  
  if (riskScore > 0.7) {
    recommendations.push('High risk detected - implement additional safety measures');
    recommendations.push('Conduct safety briefing before work begins');
  }
  
  if (factors.weatherRisk > 0.5) {
    recommendations.push('Weather conditions hazardous - consider postponing outdoor work');
  }
  
  if (factors.workforceRisk > 0.5) {
    recommendations.push('High number of inexperienced workers - assign experienced supervisors');
  }
  
  return recommendations;
}

function getPreventionMeasures(type) {
  const measures = {
    fall: ['Use fall protection equipment', 'Install guardrails', 'Inspect scaffolding'],
    equipment: ['Perform equipment inspection', 'Verify operator certification', 'Clear work area'],
    struck_by: ['Establish exclusion zones', 'Use spotters', 'Wear high-visibility clothing'],
    electrical: ['Lock out/tag out procedures', 'Use insulated tools', 'Verify power off']
  };
  
  return measures[type] || [];
}
```

---

## Advanced Topics

### Accessing CortexBuild API

```javascript
async function execute(input, context) {
  // GET request
  const projects = await context.api.get('/api/projects');
  
  // POST request
  const newTask = await context.api.post('/api/tasks', {
    projectId: input.data.projectId,
    title: 'Generated Task',
    description: 'Auto-generated by agent'
  });
  
  return { success: true, data: { task: newTask } };
}
```

### Working with External APIs

```javascript
// External API calls require approval
async function execute(input, context) {
  // Check if external API is allowed
  if (!context.permissions.includes('external_api')) {
    return {
      success: false,
      errors: ['Agent does not have permission for external API calls']
    };
  }
  
  // Make external call (simplified - actual implementation varies)
  const response = await fetch('https://api.example.com/data', {
    headers: { 'Authorization': `Bearer ${context.externalApiKey}` }
  });
  
  const data = await response.json();
  return { success: true, data };
}
```

### State Management

```javascript
// Agents are stateless - use context.storage for persistence
async function execute(input, context) {
  // Read previous state
  const previousRuns = context.storage.get('runCount') || 0;
  
  // Process data
  const result = processData(input.data);
  
  // Update state
  context.storage.set('runCount', previousRuns + 1);
  context.storage.set('lastRun', new Date().toISOString());
  
  return {
    success: true,
    data: result,
    metadata: {
      totalRuns: previousRuns + 1,
      lastRun: context.storage.get('lastRun')
    }
  };
}
```

---

## Support & Resources

- **API Documentation**: `/docs/API_AGENTS_DOCUMENTATION.md`
- **Webhook Guide**: `/docs/WEBHOOK_INTEGRATION_GUIDE.md`
- **Developer Portal**: Access at Developer Dashboard → AI Agents
- **Support Email**: <dev@cortexbuild.com>
- **Community Forum**: <https://community.cortexbuild.com>

---

## Changelog

### Version 1.0.0 (2025-11-09)

- Initial release
- Basic agent creation and execution
- Marketplace publishing
- 6 agent categories supported
