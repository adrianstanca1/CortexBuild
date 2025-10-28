#!/bin/bash

echo "🔍 ASAgents Final - Localhost Deployment Status"
echo "==============================================="
echo

echo "📊 Server Status Check:"
echo "----------------------"

# Check development server
if curl -s -o /dev/null -w "%{http_code}" http://localhost:5173/ | grep -q "200"; then
    echo "🔥 Development Server: ✅ RUNNING (http://localhost:5173/)"
else
    echo "🔥 Development Server: ❌ NOT RUNNING"
fi

# Check preview server
if curl -s -o /dev/null -w "%{http_code}" http://localhost:4173/ | grep -q "200"; then
    echo "📦 Preview Server: ✅ RUNNING (http://localhost:4173/)"
else
    echo "📦 Preview Server: ❌ NOT RUNNING"
fi

# Check static server
if curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/ | grep -q "200"; then
    echo "📁 Static Server: ✅ RUNNING (http://localhost:8080/)"
else
    echo "📁 Static Server: ❌ NOT RUNNING"
fi

echo
echo "🎯 Quick Commands:"
echo "=================="
echo "• Open Development: open http://localhost:5173/"
echo "• Open Preview: open http://localhost:4173/"
echo "• Open Static: open http://localhost:8080/"
echo "• Stop All Servers: pkill -f 'vite|http-server'"
echo "• Restart Dev: cd /Users/admin/final && pnpm dev"
echo

echo "✨ Ready for development!"