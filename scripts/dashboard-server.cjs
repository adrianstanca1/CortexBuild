/* eslint-disable no-unused-vars, no-undef */
#!/usr/bin/env node

// Simple HTTP Server for DevOps Dashboard
const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const PORT = 3006;
const ROOT_DIR = path.join(__dirname, '..');

// MIME types
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon'
};

function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return mimeTypes[ext] || 'text/plain';
}

function serveFile(res, filePath) {
  const fullPath = path.join(ROOT_DIR, filePath);
  
  fs.readFile(fullPath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('File not found');
      return;
    }
    
    const mimeType = getMimeType(filePath);
    res.writeHead(200, { 
      'Content-Type': mimeType,
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    res.end(data);
  });
}

async function runMonitoring() {
  return new Promise((resolve, reject) => {
    const monitor = spawn('node', ['scripts/devops-monitor.cjs'], {
      cwd: ROOT_DIR,
      stdio: 'pipe'
    });
    
    let output = '';
    monitor.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    monitor.stderr.on('data', (data) => {
      console.error('Monitor error:', data.toString());
    });
    
    monitor.on('close', (code) => {
      if (code === 0) {
        resolve(output);
      } else {
        reject(new Error(`Monitor exited with code ${code}`));
      }
    });
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const pathname = url.pathname;
  
  console.log(`${new Date().toISOString()} - ${req.method} ${pathname}`);
  
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(200, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    res.end();
    return;
  }
  
  // Handle refresh endpoint
  if (pathname === '/refresh-devops' && req.method === 'POST') {
    try {
      console.log('Running DevOps monitoring...');
      await runMonitoring();
      res.writeHead(200, { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      });
      res.end(JSON.stringify({ success: true, message: 'Monitoring completed' }));
    } catch (error) {
      console.error('Monitoring failed:', error);
      res.writeHead(500, { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      });
      res.end(JSON.stringify({ success: false, error: error.message }));
    }
    return;
  }
  
  // Serve dashboard as root
  if (pathname === '/' || pathname === '/index.html') {
    serveFile(res, 'devops-dashboard.html');
    return;
  }
  
  // Serve DevOps report
  if (pathname === '/devops-report.json') {
    serveFile(res, 'devops-report.json');
    return;
  }
  
  // Serve static files
  if (pathname.startsWith('/')) {
    const filePath = pathname.substring(1); // Remove leading slash
    serveFile(res, filePath);
    return;
  }
  
  // 404 for everything else
  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not found');
});

server.listen(PORT, () => {
  console.log(`🚀 DevOps Dashboard Server running on http://localhost:${PORT}`);
  console.log(`📊 Dashboard: http://localhost:${PORT}/`);
  console.log(`📋 Report API: http://localhost:${PORT}/devops-report.json`);
  console.log(`🔄 Refresh API: http://localhost:${PORT}/refresh-devops`);
  
  // Run initial monitoring
  console.log('Running initial DevOps monitoring...');
  runMonitoring().then(() => {
    console.log('✅ Initial monitoring completed');
  }).catch(error => {
    console.error('❌ Initial monitoring failed:', error.message);
  });
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down DevOps Dashboard Server...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

module.exports = server;
