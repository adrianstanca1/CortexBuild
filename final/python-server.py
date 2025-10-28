#!/usr/bin/env python3
import http.server
import socketserver
import json
from datetime import datetime

class CustomHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        print(f"{datetime.now().isoformat()} - GET {self.path}")
        
        if self.path == '/' or self.path == '/index.html':
            self.send_response(200)
            self.send_header('Content-type', 'text/html')
            self.end_headers()
            
            html = """<!DOCTYPE html>
<html>
<head>
    <title>ASAgents Final - Python Server</title>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            margin: 0; 
            padding: 50px; 
            background: linear-gradient(45deg, #ff6b6b, #4ecdc4); 
            color: white; 
            text-align: center; 
            min-height: 100vh; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
        }
        .container { 
            background: rgba(255,255,255,0.1); 
            padding: 50px; 
            border-radius: 20px; 
            backdrop-filter: blur(10px); 
        }
        h1 { font-size: 3em; margin-bottom: 30px; }
        .status { 
            background: rgba(76, 175, 80, 0.3); 
            padding: 20px; 
            border-radius: 10px; 
            margin: 20px 0; 
            border: 2px solid #4CAF50; 
        }
        button { 
            background: #2196F3; 
            color: white; 
            padding: 15px 30px; 
            border: none; 
            border-radius: 5px; 
            font-size: 16px; 
            cursor: pointer; 
            margin: 10px; 
        }
        button:hover { background: #1976D2; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🐍 Python Server Working!</h1>
        <div class="status">
            <h2>✅ ASAgents Final - Alternative Server</h2>
            <p>🐍 Python HTTP server is running</p>
            <p>🌐 Port 8000 is accessible</p>
            <p>⚡ This proves your browser can connect</p>
            <p>🕐 Time: <span id="time"></span></p>
        </div>
        <button onclick="alert('Python server is working!')">Test Python Server</button>
        <button onclick="location.reload()">Reload</button>
        <div style="margin-top: 30px; opacity: 0.8;">
            If you can see this, your network and browser are working fine!<br>
            URL: http://localhost:8000
        </div>
    </div>
    <script>
        document.getElementById('time').textContent = new Date().toLocaleTimeString();
        setInterval(() => {
            document.getElementById('time').textContent = new Date().toLocaleTimeString();
        }, 1000);
        console.log('Python server page loaded successfully!');
    </script>
</body>
</html>"""
            self.wfile.write(html.encode())
            
        elif self.path == '/test':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            
            response = {
                "status": "success",
                "message": "Python server working!",
                "timestamp": datetime.now().isoformat(),
                "port": 8000
            }
            self.wfile.write(json.dumps(response).encode())
        else:
            super().do_GET()

if __name__ == "__main__":
    PORT = 8000
    print(f"\n🐍 Starting Python server...")
    print(f"📅 Time: {datetime.now().isoformat()}")
    print(f"🌐 Server: http://localhost:{PORT}/")
    print(f"🔧 Test: http://localhost:{PORT}/test")
    print(f"✅ Python server ready!\n")
    
    with socketserver.TCPServer(("", PORT), CustomHandler) as httpd:
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n👋 Shutting down Python server...")
            httpd.shutdown()
            print("✅ Python server stopped")