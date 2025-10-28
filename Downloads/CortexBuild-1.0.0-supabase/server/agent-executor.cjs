/**
 * Agent Executor - Child Process for Individual Agent Execution
 * This script is spawned by the worker process to execute agent jobs
 */

const { parentPort } = require('worker_threads');

// Get job data from environment variables
const jobId = process.env.AGENT_JOB_ID;
const agentId = process.env.AGENT_ID;
const userId = process.env.USER_ID;
const companyId = process.env.COMPANY_ID;
const payload = JSON.parse(process.env.JOB_PAYLOAD || '{}');

async function executeAgent() {
  try {
    console.log(`🔄 Executing agent ${agentId} for job ${jobId}`);

    // Import required modules
    const Database = require('better-sqlite3');
    const path = require('path');

    // Connect to database
    const dbPath = path.join(process.cwd(), 'cortexbuild.db');
    const db = new Database(dbPath);

    // Get agent configuration
    const agentStmt = db.prepare(`
      SELECT * FROM agents WHERE id = ?
    `);
    const agent = agentStmt.get(agentId);

    if (!agent) {
      throw new Error(`Agent ${agentId} not found`);
    }

    // Execute agent logic based on type
    let result;
    switch (agent.type) {
      case 'ai_assistant':
        result = await executeAIAssistant(agent, payload, userId, companyId);
        break;
      case 'data_processor':
        result = await executeDataProcessor(agent, payload, userId, companyId);
        break;
      case 'automation':
        result = await executeAutomation(agent, payload, userId, companyId);
        break;
      default:
        throw new Error(`Unknown agent type: ${agent.type}`);
    }

    // Send success result back to parent
    if (parentPort) {
      parentPort.postMessage({
        type: 'result',
        data: result
      });
    } else {
      console.log('✅ Agent execution completed:', result);
    }

    db.close();
    process.exit(0);

  } catch (error) {
    console.error('❌ Agent execution failed:', error);

    // Send error back to parent
    if (parentPort) {
      parentPort.postMessage({
        type: 'error',
        error: error.message
      });
    }

    process.exit(1);
  }
}

async function executeAIAssistant(agent, payload, userId, companyId) {
  // Import AI services
  const { GoogleGenerativeAI } = require('@google/generative-ai');
  const OpenAI = require('openai');

  const config = JSON.parse(agent.config || '{}');

  let aiClient;
  if (config.provider === 'openai') {
    aiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  } else if (config.provider === 'gemini') {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    aiClient = genAI.getGenerativeModel({ model: 'gemini-pro' });
  }

  // Execute AI task
  const response = await aiClient.generateContent({
    contents: [{ role: 'user', parts: [{ text: payload.prompt || 'Hello' }] }]
  });

  return {
    response: response.response.text(),
    agent_id: agentId,
    user_id: userId,
    company_id: companyId,
    executed_at: new Date().toISOString()
  };
}

async function executeDataProcessor(agent, payload, userId, companyId) {
  // Implement data processing logic
  const config = JSON.parse(agent.config || '{}');

  // Example: Process CSV data, transform records, etc.
  const processedData = {
    input_count: payload.data?.length || 0,
    processed_at: new Date().toISOString(),
    transformations: config.transformations || []
  };

  return processedData;
}

async function executeAutomation(agent, payload, userId, companyId) {
  // Implement automation logic
  const config = JSON.parse(agent.config || '{}');

  // Example: Send notifications, update records, trigger workflows
  const automationResult = {
    actions_executed: config.actions || [],
    triggered_at: new Date().toISOString(),
    status: 'completed'
  };

  return automationResult;
}

// Execute the agent
executeAgent();