// Production Server for CortexBuild
// Serves the built frontend and proxies API requests

const express = require('express');
const path = require('path');
// const { createProxyMiddleware } = require('http-proxy-middleware'); // Reserved for future use

const app = express();
const PORT = process.env.PORT || 3000;
const API_PORT = process.env.API_PORT || 3001;

// Security headers middleware
app.use((req, res, next) => {
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Content-Security-Policy',
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://unpkg.com; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net; " +
    "img-src 'self' data: https:; " +
    "font-src 'self' https: https://fonts.gstatic.com https://fonts.googleapis.com; " +
    "connect-src 'self' https: wss: https://*.supabase.co https://api.openai.com https://generativelanguage.googleapis.com; " +
    "frame-ancestors 'none';"
  );
  next();
});

// API Proxy - Forward API requests to the API server
app.use('/api', (req, res) => {
  const apiUrl = `http://localhost:${API_PORT}${req.originalUrl}`;
  console.log(`Proxying: ${req.method} ${req.originalUrl} -> ${apiUrl}`);

  const http = require('http');
  const options = {
    hostname: 'localhost',
    port: API_PORT,
    path: req.originalUrl,
    method: req.method,
    headers: req.headers
  };

  const proxyReq = http.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res);
  });

  proxyReq.on('error', (err) => {
    console.error('Proxy error:', err);
    res.status(500).json({
      error: 'API server unavailable',
      message: 'Please ensure the API server is running on port ' + API_PORT
    });
  });

  if (req.body) {
    proxyReq.write(JSON.stringify(req.body));
  }
  proxyReq.end();
});

// Serve static files from dist directory
app.use(express.static(path.join(__dirname, 'dist'), {
  maxAge: '1y', // Cache static assets for 1 year
  etag: true,
  lastModified: true,
  setHeaders: (res, path) => {
    // Set cache headers for different file types
    if (path.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    } else if (path.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$/)) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    }
  }
}));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'CortexBuild Production Server',
    version: '2.0.0'
  });
});

// Catch-all handler: send back React's index.html file for SPA routing
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Error handling middleware
app.use((err, req, res) => {
  console.error('Server error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 CortexBuild Production Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 API proxy: http://localhost:${PORT}/api/* -> http://localhost:${API_PORT}/api/*`);
  console.log(`📁 Serving static files from: ${path.join(__dirname, 'dist')}`);
  
  // Check if API server is running
  const http = require('http');
  const apiCheck = http.get(`http://localhost:${API_PORT}/api/health`, (res) => {
    if (res.statusCode === 200) {
      console.log(`✅ API server is running on port ${API_PORT}`);
    }
  });
  
  apiCheck.on('error', () => {
    console.log(`⚠️  API server not detected on port ${API_PORT}. Start it with: node api-server-simple.cjs`);
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});
