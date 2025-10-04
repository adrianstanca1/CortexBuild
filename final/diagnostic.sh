#!/bin/bash

echo "🔍 ASAgents Final - Network Diagnostic Tool"
echo "==========================================="
echo

echo "📊 Checking Server Status:"
echo "=========================="

# Check Node.js server
echo -n "Node.js Server (port 3000): "
if curl -s -m 3 http://localhost:3000/test > /dev/null 2>&1; then
    echo "✅ WORKING"
else
    echo "❌ NOT RESPONDING"
fi

# Check Python server  
echo -n "Python Server (port 8000): "
if curl -s -m 3 http://localhost:8000/test > /dev/null 2>&1; then
    echo "✅ WORKING"
else
    echo "❌ NOT RESPONDING"
fi

echo
echo "🌐 Network Information:"
echo "======================"
echo "Hostname: $(hostname)"
echo "Local IP: $(ifconfig | grep 'inet 192' | awk '{print $2}' | head -1)"
echo "Date/Time: $(date)"

echo
echo "🔧 Port Status:"
echo "==============="
netstat -an | grep LISTEN | grep -E ":3000|:8000" | head -5

echo
echo "📋 Process Information:"
echo "======================"
ps aux | grep -E "(node.*server|python.*server)" | grep -v grep | head -5

echo
echo "🧪 Quick Tests:"
echo "==============="
echo "Node.js test:"
curl -s -m 3 http://localhost:3000/test || echo "Failed to connect"
echo
echo "Python test:"
curl -s -m 3 http://localhost:8000/test || echo "Failed to connect"

echo
echo "✅ Diagnostic Complete!"
echo "======================"
echo "If servers show as WORKING above, try these URLs in your browser:"
echo "• http://localhost:3000/ (Node.js - Fancy interface)"
echo "• http://localhost:8000/ (Python - Simple interface)"
echo "• http://127.0.0.1:3000/ (Alternative Node.js)"
echo "• http://127.0.0.1:8000/ (Alternative Python)"