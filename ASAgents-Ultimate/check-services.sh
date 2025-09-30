#!/bin/bash

echo "🔍 ASAgents-Ultimate - Service Status Check"
echo "==========================================="
echo ""

# Check Backend
echo "1️⃣ Checking Backend (Port 4000)..."
BACKEND_STATUS=$(curl -s http://localhost:4000/api/system/health 2>/dev/null)
if [ $? -eq 0 ]; then
    echo "   ✅ Backend is running"
    echo "   📡 http://localhost:4000"
else
    echo "   ❌ Backend is NOT running"
    echo "   💡 Start with: cd server && npm run dev:simple"
fi
echo ""

# Check Frontend
echo "2️⃣ Checking Frontend (Port 5173)..."
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5173/ 2>/dev/null)
if [ "$FRONTEND_STATUS" = "200" ]; then
    echo "   ✅ Frontend is running"
    echo "   🌐 http://localhost:5173"
else
    echo "   ❌ Frontend is NOT running"
    echo "   💡 Start with: npm run dev"
fi
echo ""

# Summary
echo "📊 Quick Links:"
echo "   🏠 App:        http://localhost:5173"
echo "   🧪 API Test:   http://localhost:5173/api-test.html"
echo "   ❤️  Health:    http://localhost:4000/api/system/health"
echo ""

# If both running
if [ $? -eq 0 ] && [ "$FRONTEND_STATUS" = "200" ]; then
    echo "🎉 All services are running! Application is ready!"
    echo ""
    echo "Next Steps:"
    echo "  1. Test: http://localhost:5173/api-test.html"
    echo "  2. Deploy: vercel --prod"
else
    echo "⚠️  Some services are not running. Please start them."
fi
echo ""
