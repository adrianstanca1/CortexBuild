// Simple API Server for Testing Authentication
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { AuthMiddleware, authHelpers } = require('./middleware/auth.cjs');

const app = express();
const PORT = 3001;

// Initialize authentication middleware
const auth = new AuthMiddleware();

// Basic middleware
app.use(helmet());
app.use(cors({
  origin: ['http://localhost:3005', 'http://localhost:3006'],
  credentials: true
}));
app.use(express.json());

// Health check endpoint (public)
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'CortexBuild API Server (Simple)'
  });
});

// Authentication endpoints
app.post('/api/auth/login', async (req, res) => {
  try {
    console.log('Login request received:', req.body);
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }
    
    const user = authHelpers.findUserByEmail(email);
    console.log('User lookup result:', user ? 'found' : 'not found');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }
    
    const isValidPassword = authHelpers.validatePassword(password, user.password);
    console.log('Password validation:', isValidPassword);
    
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }
    
    const token = auth.generateToken(user);
    console.log('Token generated successfully');
    
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

// Test protected endpoint
app.get('/api/test-protected', auth.requireUser(), (req, res) => {
  res.json({
    success: true,
    message: 'Protected endpoint accessed successfully',
    user: req.user
  });
});

// Chat endpoint (protected)
app.get('/api/chat/message', auth.authenticate(), auth.requireUser(), (req, res) => {
  res.json({
    success: true,
    messages: [],
    user: req.user.email
  });
});

// Platform admin endpoint (admin only)
app.get('/api/platformAdmin', auth.requireAdmin(), (req, res) => {
  res.json({
    success: true,
    message: 'Platform Admin API accessed',
    user: req.user.email
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Simple API Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔐 Login: POST http://localhost:${PORT}/api/auth/login`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server...');
  process.exit(0);
});
