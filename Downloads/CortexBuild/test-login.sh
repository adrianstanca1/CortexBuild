#!/bin/bash

echo "🔐 Testing Login..."
echo ""

curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"adrian.stanca1@gmail.com","password":"password123"}'

echo ""
echo ""
