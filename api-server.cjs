// Simple API Server for CortexBuild Development
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Mock chat sessions storage
const chatSessions = new Map();

// Mock chat responses
const mockResponses = [
  "I can help you with project management tasks. What would you like to know?",
  "Based on your current projects, I recommend focusing on the high-priority tasks first.",
  "I've analyzed your team's performance and found some optimization opportunities.",
  "Would you like me to create a task for that? I can assign it to the appropriate team member.",
  "The weather forecast shows rain tomorrow. Consider adjusting outdoor work schedules.",
  "Your project is 15% ahead of schedule. Great work!",
  "I notice some safety compliance items need attention. Shall I create reminders?",
  "Based on historical data, this type of task typically takes 3-4 hours to complete.",
  "I can help you generate a progress report for stakeholders.",
  "Your team's productivity has increased by 12% this month compared to last month."
];

// Generate AI response based on user input
function generateAIResponse(userMessage, conversationHistory) {
  const lowerMessage = userMessage.toLowerCase();
  
  // Context-aware responses based on keywords
  if (lowerMessage.includes('project') && lowerMessage.includes('status')) {
    return "I can see you have 3 active projects. Project Alpha is 75% complete and on schedule, Project Beta is 60% complete but 2 days behind, and Project Gamma just started this week. Would you like detailed information about any specific project?";
  }
  
  if (lowerMessage.includes('task') && (lowerMessage.includes('create') || lowerMessage.includes('add'))) {
    return "I can help you create a new task. What's the task title, and which project should it be assigned to? I'll also need to know the priority level and estimated duration.";
  }
  
  if (lowerMessage.includes('team') && lowerMessage.includes('performance')) {
    return "Your team's performance metrics show: Average task completion time has improved by 18% this month. John is your top performer with 95% on-time completion. Sarah might need additional support as she's currently at 78% completion rate. Would you like me to suggest some optimization strategies?";
  }
  
  if (lowerMessage.includes('help') || lowerMessage.includes('what can you do')) {
    return "I'm your AI construction assistant! I can help with: 📊 Project status updates, 📋 Task management, 👥 Team performance analysis, 💰 Budget tracking, 🛡️ Safety compliance, 📅 Schedule optimization, 🌤️ Weather-based recommendations, and 📈 Generate reports. What would you like to explore?";
  }
  
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
    return "Hello! I'm your AI construction management assistant. I'm here to help you manage projects, track progress, analyze performance, and optimize your construction operations. How can I assist you today?";
  }
  
  // Default responses with some variety
  const randomResponse = mockResponses[Math.floor(Math.random() * mockResponses.length)];
  return randomResponse;
}

// Chat API endpoints
app.get('/api/chat/message', async (req, res) => {
  try {
    const { sessionId } = req.query;
    
    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID is required' });
    }

    // Get chat history
    const session = chatSessions.get(sessionId);
    const messages = session ? session.messages : [];
    
    res.json({ messages });
  } catch (error) {
    console.error('Chat API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/chat/message', async (req, res) => {
  try {
    const { sessionId } = req.query;
    const { message } = req.body;
    
    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID is required' });
    }
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Get or create session
    let session = chatSessions.get(sessionId);
    if (!session) {
      session = {
        id: sessionId,
        userId: 'demo-user-123',
        messages: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      chatSessions.set(sessionId, session);
    }

    // Add user message
    const userMessage = {
      id: `msg-${Date.now()}-user`,
      content: message,
      role: 'user',
      timestamp: new Date().toISOString(),
      sessionId
    };
    session.messages.push(userMessage);

    // Generate AI response
    const responseContent = generateAIResponse(message, session.messages);
    const aiMessage = {
      id: `msg-${Date.now()}-ai`,
      content: responseContent,
      role: 'assistant',
      timestamp: new Date().toISOString(),
      sessionId
    };
    session.messages.push(aiMessage);

    session.updatedAt = new Date().toISOString();

    res.json({ message: aiMessage });
  } catch (error) {
    console.error('Chat API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'CortexBuild API Server'
  });
});

// Platform admin endpoints
app.get('/api/platformAdmin', (req, res) => {
  res.json({ 
    message: 'Platform Admin API is working',
    timestamp: new Date().toISOString()
  });
});

// Simple fallback for unknown routes
app.use((req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 CortexBuild API Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`💬 Chat API: http://localhost:${PORT}/api/chat/message`);
});

module.exports = app;
