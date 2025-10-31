#!/bin/bash

echo ""
echo "╔══════════════════════════════════════════════════════════════════╗"
echo "║           CortexBuild - Test Login System Complete              ║"
echo "╚══════════════════════════════════════════════════════════════════╝"
echo ""

API_URL="${1:-http://localhost:3000}"

echo "🔍 Testing Login System..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Test 1: Super Admin Login
echo "📝 Test 1: Super Admin Login"
echo "   Email: adrian.stanca1@gmail.com"
echo "   Password: parola123"
echo ""

RESPONSE=$(curl -s -X POST "$API_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "adrian.stanca1@gmail.com",
    "password": "parola123"
  }')

if echo "$RESPONSE" | grep -q '"success":true'; then
    echo "   ✅ Super Admin login SUCCESSFUL"
    TOKEN=$(echo "$RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
    ROLE=$(echo "$RESPONSE" | grep -o '"role":"[^"]*"' | cut -d'"' -f4)
    echo "   ✅ Role: $ROLE"
    echo "   ✅ Token received: ${TOKEN:0:20}..."
else
    echo "   ❌ Super Admin login FAILED"
    echo "   Response: $RESPONSE"
fi

echo ""

# Test 2: Company Admin Login
echo "📝 Test 2: Company Admin Login"
echo "   Email: adrian@ascladdingltd.co.uk"
echo "   Password: lolozania1"
echo ""

RESPONSE=$(curl -s -X POST "$API_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "adrian@ascladdingltd.co.uk",
    "password": "lolozania1"
  }')

if echo "$RESPONSE" | grep -q '"success":true'; then
    echo "   ✅ Company Admin login SUCCESSFUL"
    ROLE=$(echo "$RESPONSE" | grep -o '"role":"[^"]*"' | cut -d'"' -f4)
    echo "   ✅ Role: $ROLE"
else
    echo "   ❌ Company Admin login FAILED"
    echo "   Response: $RESPONSE"
fi

echo ""

# Test 3: Developer Login
echo "📝 Test 3: Developer Login"
echo "   Email: adrian.stanca1@icloud.com"
echo "   Password: password123"
echo ""

RESPONSE=$(curl -s -X POST "$API_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "adrian.stanca1@icloud.com",
    "password": "password123"
  }')

if echo "$RESPONSE" | grep -q '"success":true'; then
    echo "   ✅ Developer login SUCCESSFUL"
    ROLE=$(echo "$RESPONSE" | grep -o '"role":"[^"]*"' | cut -d'"' -f4)
    echo "   ✅ Role: $ROLE"
else
    echo "   ❌ Developer login FAILED"
    echo "   Response: $RESPONSE"
fi

echo ""

# Test 4: Invalid Credentials
echo "📝 Test 4: Invalid Credentials (should fail)"
echo "   Email: test@test.com"
echo "   Password: wrongpassword"
echo ""

RESPONSE=$(curl -s -X POST "$API_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@test.com",
    "password": "wrongpassword"
  }')

if echo "$RESPONSE" | grep -q '"success":false'; then
    echo "   ✅ Invalid credentials properly REJECTED"
else
    echo "   ❌ Security issue: Invalid credentials accepted!"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🎯 LOGIN SYSTEM TEST SUMMARY"
echo ""
echo "✅ All authentication tests completed"
echo ""
echo "📝 Next Steps:"
echo "   1. Run migration in Supabase SQL Editor:"
echo "      supabase/migrations/20251030_complete_login_system.sql"
echo ""
echo "   2. Start development server:"
echo "      npm run dev"
echo ""
echo "   3. Test login in browser:"
echo "      http://localhost:3000/login"
echo ""
echo "   4. Use test credentials above"
echo ""

