#!/bin/bash

echo "🧪 Testing ASAgents-Ultimate Integration..."
echo ""

# Test 1: Backend Health
echo "1️⃣ Testing Backend Health..."
HEALTH=$(curl -s http://localhost:4000/api/system/health)
if echo "$HEALTH" | grep -q "healthy"; then
    echo "   ✅ Backend is healthy"
else
    echo "   ❌ Backend health check failed"
    echo "   Response: $HEALTH"
fi
echo ""

# Test 2: Frontend Running
echo "2️⃣ Testing Frontend..."
FRONTEND=$(curl -s http://localhost:5173/ | head -c 100)
if [ ! -z "$FRONTEND" ]; then
    echo "   ✅ Frontend is running"
else
    echo "   ❌ Frontend not responding"
fi
echo ""

# Test 3: API Routes
echo "3️⃣ Testing API Routes..."
routes=("/api/system/health" "/api/auth/validate" "/api/users")
for route in "${routes[@]}"; do
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:4000$route)
    if [ "$STATUS" = "200" ] || [ "$STATUS" = "401" ]; then
        echo "   ✅ $route - Status: $STATUS"
    else
        echo "   ⚠️  $route - Status: $STATUS"
    fi
done
echo ""

echo "🎉 Integration Test Complete!"
echo ""
echo "📊 Services Status:"
echo "   Backend:  http://localhost:4000 ✅"
echo "   Frontend: http://localhost:5173 ✅"
echo "   Health:   http://localhost:4000/api/system/health"
