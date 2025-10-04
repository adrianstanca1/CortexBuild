import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const port = 3000;

const server = http.createServer((req, res) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.url === '/' || req.url === '/index.html') {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ASAgents Final - Working!</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
        }
        .container {
            max-width: 600px;
            background: rgba(255,255,255,0.1);
            padding: 40px;
            border-radius: 20px;
            backdrop-filter: blur(15px);
            box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
            text-align: center;
            border: 1px solid rgba(255,255,255,0.18);
        }
        h1 { font-size: 3rem; margin-bottom: 20px; }
        .success { 
            background: rgba(34, 197, 94, 0.3);
            border: 2px solid #22c55e;
            padding: 20px;
            border-radius: 15px;
            margin: 20px 0;
        }
        .status { margin: 15px 0; font-size: 1.1rem; }
        .button {
            background: #3b82f6;
            color: white;
            padding: 15px 30px;
            border: none;
            border-radius: 10px;
            cursor: pointer;
            margin: 10px;
            font-size: 16px;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px 0 rgba(31, 38, 135, 0.4);
        }
        .button:hover { 
            background: #1d4ed8; 
            transform: translateY(-3px);
            box-shadow: 0 6px 20px 0 rgba(31, 38, 135, 0.6);
        }
        .info {
            background: rgba(59, 130, 246, 0.2);
            border: 1px solid #3b82f6;
            padding: 15px;
            border-radius: 10px;
            margin: 20px 0;
        }
        #time { font-weight: bold; color: #4ade80; }
        .pulse { animation: pulse 2s infinite; }
        @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.5; }
            100% { opacity: 1; }
        }
    </style>
</head>
<body>
    <div class="container">
        <h1 class="pulse">🎉 SUCCESS!</h1>
        
        <div class="success">
            <h2>✅ ASAgents Final is Working!</h2>
            <div class="status">🚀 Node.js server is running</div>
            <div class="status">💻 HTTP server is responding</div>
            <div class="status">🌐 Port 3000 is accessible</div>
            <div class="status">⚡ Real-time updates working</div>
        </div>
        
        <div class="info">
            <h3>📊 Server Status</h3>
            <p>Current time: <span id="time"></span></p>
            <p>Server: http://localhost:3000</p>
            <p>Status: <span style="color: #4ade80;">ONLINE</span></p>
        </div>
        
        <button class="button" onclick="testFunction()">🧪 Test JavaScript</button>
        <button class="button" onclick="location.reload()">🔄 Reload</button>
        <button class="button" onclick="showMore()">📋 Show Details</button>
        
        <div id="details" style="display: none; margin-top: 20px; text-align: left;">
            <div class="info">
                <h4>🔧 Technical Details:</h4>
                <p>• Server Type: Node.js HTTP Server</p>
                <p>• Port: 3000</p>
                <p>• Protocol: HTTP/1.1</p>
                <p>• CORS: Enabled</p>
                <p>• Time: <span id="details-time"></span></p>
            </div>
        </div>
        
        <div style="margin-top: 30px; opacity: 0.8; font-size: 14px;">
            If you can see this page, your development environment is working perfectly! ✨
        </div>
    </div>

    <script>
        let clickCount = 0;
        
        function updateTime() {
            const now = new Date();
            const timeStr = now.toLocaleTimeString();
            document.getElementById('time').textContent = timeStr;
            const detailsTime = document.getElementById('details-time');
            if (detailsTime) detailsTime.textContent = timeStr;
        }
        
        function testFunction() {
            clickCount++;
            alert(\`🎉 JavaScript Test #\${clickCount} - Everything is working perfectly!\`);
            console.log('ASAgents Final: JavaScript test successful #' + clickCount);
        }
        
        function showMore() {
            const details = document.getElementById('details');
            details.style.display = details.style.display === 'none' ? 'block' : 'none';
        }
        
        // Update time every second
        updateTime();
        setInterval(updateTime, 1000);
        
        console.log('🚀 ASAgents Final - Standalone server loaded successfully!');
        console.log('Server time:', new Date().toISOString());
        console.log('If you can see this, everything is working!');
    </script>
</body>
</html>`);
    } else if (req.url === '/test') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            status: 'success',
            message: 'ASAgents Final server is working!',
            timestamp: new Date().toISOString(),
            port: port
        }));
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Page not found');
    }
});

server.listen(port, () => {
    console.log(`\n🚀 ASAgents Final Server Starting...`);
    console.log(`📅 Time: ${new Date().toISOString()}`);
    console.log(`🌐 Server running at: http://localhost:${port}/`);
    console.log(`🔧 Test endpoint: http://localhost:${port}/test`);
    console.log(`✅ Server is ready and accessible!\n`);
});

server.on('error', (err) => {
    console.error('❌ Server error:', err);
});

process.on('SIGINT', () => {
    console.log('\n👋 Shutting down server...');
    server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
    });
});