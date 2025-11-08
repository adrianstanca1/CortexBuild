// Secure API Server for CortexBuild Development
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { AuthMiddleware, authHelpers } = require('./middleware/auth.cjs');

const app = express();
const PORT = 3001;

// Initialize authentication middleware
const auth = new AuthMiddleware();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

// CORS configuration
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3005', 'http://localhost:3006'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key', 'X-CSRF-Token']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
app.use('/api/', auth.rateLimit(100, 15 * 60 * 1000)); // 100 requests per 15 minutes

// Authentication middleware for protected routes (applied after public routes)
// This will be applied selectively to protected endpoints

// Mock chat sessions storage
const chatSessions = new Map();

// Authentication endpoints
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }

    const user = authHelpers.findUserByEmail(email);
    console.log('Login attempt:', { email, userFound: !!user });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    const isValidPassword = authHelpers.validatePassword(password, user.password);
    console.log('Password validation:', { isValid: isValidPassword });

    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    const token = auth.generateToken(user);

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

app.get('/api/auth/me', async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Not authenticated'
      });
    }

    const user = authHelpers.findUserById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

app.post('/api/auth/logout', (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

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
function generateAIResponse(userMessage) {
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

// Chat API endpoints (protected)
app.get('/api/chat/message', auth.requireUser(), async (req, res) => {
  try {
    const { sessionId } = req.query;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        error: 'Session ID is required'
      });
    }

    // Ensure user can only access their own sessions
    const userSessionId = `${req.user.id}-${sessionId}`;
    const session = chatSessions.get(userSessionId);
    const messages = session ? session.messages : [];

    res.json({
      success: true,
      messages
    });
  } catch (error) {
    console.error('Chat API error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// OPTIONS handler removed - CORS middleware (line 32-37) handles preflight requests
// The CORS middleware properly restricts origins to configured values

app.post('/api/chat/message', auth.requireUser(), async (req, res) => {
  try {
    const { sessionId } = req.query;
    const { message } = req.body;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        error: 'Session ID is required'
      });
    }

    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'Message is required'
      });
    }

    // Input validation and sanitization
    if (message.length > 1000) {
      return res.status(400).json({
        success: false,
        error: 'Message too long (max 1000 characters)'
      });
    }

    // Ensure user can only access their own sessions
    const userSessionId = `${req.user.id}-${sessionId}`;
    let session = chatSessions.get(userSessionId);
    if (!session) {
      session = {
        id: userSessionId,
        userId: req.user.id,
        messages: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      chatSessions.set(userSessionId, session);
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

// Platform admin endpoints (admin only)
app.get('/api/platformAdmin', auth.requireAdmin(), (req, res) => {
  res.json({
    success: true,
    message: 'Platform Admin API is working',
    timestamp: new Date().toISOString(),
    status: 'ok',
    user: req.user.email
  });
});

app.post('/api/platformAdmin', auth.requireAdmin(), (req, res) => {
  res.json({
    success: true,
    message: 'Platform Admin POST endpoint',
    timestamp: new Date().toISOString(),
    status: 'ok',
    data: req.body,
    user: req.user.email
  });
});

// Duplicate handlers removed:
// - /api/health (duplicate at line 301-307)
// - /api/auth/login (duplicate at line 53-103) - removed hardcoded demo handler
// - /api/auth/me (duplicate at line 105-138) - removed hardcoded demo handler
// The proper implementations with authentication are kept at lines 53-138

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
