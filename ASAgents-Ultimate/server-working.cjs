const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// API Routes
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'ASAgents Ultimate Node.js Server',
    version: '2.0.0',
    uptime: process.uptime()
  });
});

app.get('/api/projects', (req, res) => {
  res.json({
    success: true,
    data: [
      { id: 1, name: 'Office Complex', status: 'active', progress: 75 },
      { id: 2, name: 'Residential Tower', status: 'active', progress: 45 },
      { id: 3, name: 'Shopping Center', status: 'planning', progress: 15 }
    ]
  });
});

// Basic HTML page
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>ASAgents Ultimate - Node.js Server</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
            .container { max-width: 800px; margin: 0 auto; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .status { padding: 20px; background: #e6fffa; border-radius: 6px; margin: 20px 0; }
            .api-link { color: #0066cc; text-decoration: none; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🚀 ASAgents Ultimate - Node.js Server</h1>
            <p>Construction Management Platform running on Node.js + Express</p>
            
            <div class="status">
                <h3>✅ Server Status: Running</h3>
                <p>Port: ${PORT} | Node.js: ${process.version}</p>
            </div>
            
            <h3>🔗 API Endpoints:</h3>
            <ul>
                <li><a href="/api/health" class="api-link">GET /api/health</a> - Server health check</li>
                <li><a href="/api/projects" class="api-link">GET /api/projects</a> - Project data</li>
            </ul>
            
            <div style="margin-top: 30px; text-align: center; color: #666;">
                <p>Alternative to React - Stable Node.js Backend</p>
            </div>
        </div>
    </body>
    </html>
  `);
});

app.listen(PORT, () => {
  console.log(`
🚀 ASAgents Ultimate Node.js Server
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 URL: http://localhost:${PORT}
🏥 Health: http://localhost:${PORT}/api/health  
📊 Projects: http://localhost:${PORT}/api/projects
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `);
});