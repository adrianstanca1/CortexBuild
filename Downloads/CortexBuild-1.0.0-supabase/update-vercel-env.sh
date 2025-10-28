#!/bin/bash

# Update Vercel Environment Variable for Backend URL

echo "🔧 Updating Vercel environment variable..."

# Get backend URL from Render (you'll need to replace this with actual URL)
BACKEND_URL="https://cortexbuild-backend.onrender.com"

echo "📊 Backend URL: $BACKEND_URL"

# Update Vercel environment variable
echo "⚡ Setting VITE_API_URL in Vercel..."

# Option 1: Via Vercel CLI (if installed)
if command -v vercel &> /dev/null; then
    echo "$BACKEND_URL" | vercel env add VITE_API_URL production
    echo "✅ Environment variable added!"
    
    echo "🚀 Redeploying to apply changes..."
    vercel --prod
    echo "✅ Deployment complete!"
else
    echo "⚠️  Vercel CLI not found!"
    echo ""
    echo "📝 Manual steps:"
    echo "1. Go to: https://vercel.com/adrian-b7e84541/cortex-build/settings/environment-variables"
    echo "2. Add new variable:"
    echo "   Name: VITE_API_URL"
    echo "   Value: $BACKEND_URL"
    echo "   Environment: Production"
    echo "3. Redeploy the project"
fi

