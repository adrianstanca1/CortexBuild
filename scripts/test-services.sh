#!/bin/bash
# AI Services Testing Script
# Tests all AI endpoints and services

echo "🔍 CortexBuild AI Services Testing"
echo "=================================="
echo ""

# Wait for server to be ready
echo "⏳ Waiting for server to start..."
sleep 4

# Get authentication token
echo "🔐 Authenticating..."
TOKEN=$(curl -s "http://localhost:3001/api/auth/login" \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"email":"adrian.stanca1@gmail.com","password":"Cumparavinde1"}' | jq -r '.token')

if [ "$TOKEN" = "null" ] || [ -z "$TOKEN" ]; then
  echo "❌ Authentication failed!"
  exit 1
fi

echo "✅ Authentication successful"
echo "Token: ${TOKEN:0:20}..."
echo ""

# Test 1: Database Health
echo "📊 Test 1: Database Health Check"
echo "--------------------------------"
HEALTH=$(curl -s -H "Authorization: Bearer $TOKEN" "http://localhost:3001/api/health/database")
echo "$HEALTH" | jq '.'
echo ""

# Test 2: AI Chat Endpoint
echo "🤖 Test 2: AI Chat Endpoint"
echo "--------------------------------"
AI_CHAT=$(curl -s -X POST "http://localhost:3001/api/ai/chat" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "message": "Hello, this is a test message",
    "sessionId": "test-session-123",
    "currentPage": "/dashboard"
  }')
echo "$AI_CHAT" | jq '.'
echo ""

# Test 3: AI Suggest Endpoint  
echo "💡 Test 3: AI Suggestions"
echo "--------------------------------"
AI_SUGGEST=$(curl -s -X POST "http://localhost:3001/api/ai/suggest" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "context": "project management",
    "prompt": "suggest 3 tasks for a construction project"
  }')
echo "$AI_SUGGEST" | jq '.'
echo ""

# Test 4: AI Usage Stats
echo "📈 Test 4: AI Usage Statistics"
echo "--------------------------------"
AI_USAGE=$(curl -s -H "Authorization: Bearer $TOKEN" "http://localhost:3001/api/ai/usage")
echo "$AI_USAGE" | jq '.'
echo ""

# Test 5: Projects API
echo "📁 Test 5: Projects API"
echo "--------------------------------"
PROJECTS=$(curl -s -H "Authorization: Bearer $TOKEN" "http://localhost:3001/api/projects")
echo "$PROJECTS" | jq '.data | length' | xargs echo "Projects count:"
echo ""

# Test 6: Marketplace API
echo "🏪 Test 6: Marketplace API"
echo "--------------------------------"
MARKETPLACE=$(curl -s -H "Authorization: Bearer $TOKEN" "http://localhost:3001/api/marketplace")
echo "$MARKETPLACE" | jq '.'
echo ""

# Test 7: SDK Developer API
echo "🔧 Test 7: SDK Developer API"
echo "--------------------------------"
SDK=$(curl -s -H "Authorization: Bearer $TOKEN" "http://localhost:3001/api/sdk")
echo "$SDK" | jq '.'
echo ""

# Summary
echo "=================================="
echo "✅ Testing Complete!"
echo ""
echo "Results Summary:"
echo "- Authentication: ✅"
echo "- Database Health: Check output above"
echo "- AI Chat: Check output above"
echo "- AI Suggestions: Check output above"
echo "- AI Usage Stats: Check output above"
echo "- Projects API: Check output above"
echo "- Marketplace: Check output above"
echo "- SDK API: Check output above"
echo ""
echo "📝 Full report saved to test-results.json"

# Save results to file
{
  echo "{"
  echo "  \"timestamp\": \"$(date -u +"%Y-%m-%dT%H:%M:%SZ")\","
  echo "  \"database_health\": $HEALTH,"
  echo "  \"ai_chat\": $AI_CHAT,"
  echo "  \"ai_suggest\": $AI_SUGGEST,"
  echo "  \"ai_usage\": $AI_USAGE,"
  echo "  \"projects\": $PROJECTS,"
  echo "  \"marketplace\": $MARKETPLACE,"
  echo "  \"sdk\": $SDK"
  echo "}"
} > test-results.json

echo "✅ Results saved to: test-results.json"
