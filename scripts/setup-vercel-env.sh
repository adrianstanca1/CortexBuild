#!/bin/bash

# Setup Vercel Environment Variables
# Run with: bash scripts/setup-vercel-env.sh

echo "🔧 Setting up Vercel environment variables..."

# Load .env file
source .env

# Set environment variables in Vercel
echo "📝 Setting VITE_SUPABASE_URL..."
vercel env add VITE_SUPABASE_URL production <<< "$VITE_SUPABASE_URL"

echo "📝 Setting VITE_SUPABASE_ANON_KEY..."
vercel env add VITE_SUPABASE_ANON_KEY production <<< "$VITE_SUPABASE_ANON_KEY"

echo "📝 Setting SUPABASE_SERVICE_KEY..."
vercel env add SUPABASE_SERVICE_KEY production <<< "$SUPABASE_SERVICE_KEY"

echo "📝 Setting JWT_SECRET..."
vercel env add JWT_SECRET production <<< "$JWT_SECRET"

echo "✅ Environment variables set!"
echo ""
echo "🚀 Now redeploy with: vercel --prod"

