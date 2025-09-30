const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files
app.use(express.static(path.join(__dirname, 'dist')));
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'ASAgents Ultimate API',
    version: '2.0.0',
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Projects endpoint
app.get('/api/projects', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: 1,
        name: 'Office Complex Downtown',
        status: 'active',
        progress: 75,
        budget: 2500000,
        team: 'Team Alpha'
      },
      {
        id: 2,
        name: 'Residential Tower',
        status: 'active', 
        progress: 45,
        budget: 3200000,
        team: 'Team Beta'
      },
      {
        id: 3,
        name: 'Shopping Center',
        status: 'planning',
        progress: 15,
        budget: 4800000,
        team: 'Team Gamma'
      }
    ]
  });
});

// Dashboard analytics endpoint
app.get('/api/analytics/dashboard', (req, res) => {
  res.json({
    success: true,
    data: {
      totalProjects: 12,
      activeProjects: 8,
      totalBudget: 8400000,
      totalSpent: 5200000,
      averageProgress: 67,
      teamMembers: 45,
      collectionRate: 94
    }
  });
});

// Catch all handler for React Router
app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`
🚀 ASAgents Ultimate Server Running!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 URL: http://localhost:${PORT}
🏥 Health: http://localhost:${PORT}/api/health  
📊 Projects: http://localhost:${PORT}/api/projects
📈 Analytics: http://localhost:${PORT}/api/analytics/dashboard
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `);
});