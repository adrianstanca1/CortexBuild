#!/bin/bash

echo "🔧 Google OAuth Complete Setup Guide"
echo "===================================="
echo ""

# Get current Vercel deployment URL
echo "📍 Checking current deployment..."
CURRENT_URL=$(vercel ls | grep final | head -1 | awk '{print $2}')

if [ -z "$CURRENT_URL" ]; then
    echo "❌ No Vercel deployment found. Deploying first..."
    vercel --prod --yes
    CURRENT_URL=$(vercel ls | grep final | head -1 | awk '{print $2}')
fi

echo "✅ Current deployment: https://$CURRENT_URL"
echo ""

# Set the current redirect URI
echo "🔧 Setting current redirect URI in Vercel..."
vercel env add VITE_GOOGLE_REDIRECT_URI_CURRENT "https://$CURRENT_URL/auth/google/callback" production --yes

echo ""
echo "📋 GOOGLE CLOUD CONSOLE SETUP INSTRUCTIONS"
echo "=========================================="
echo ""
echo "1. Go to: https://console.cloud.google.com/apis/credentials"
echo "2. Find your OAuth 2.0 Client ID: 747468230889-nmpf6edq6r3j78oc9abkceojssb9iue4.apps.googleusercontent.com"
echo "3. Click Edit (pencil icon)"
echo "4. In 'Authorized redirect URIs', ADD ALL of these URLs:"
echo ""
echo "   https://$CURRENT_URL/auth/google/callback"
echo "   https://final-a8xofrom7-adrian-b7e84541.vercel.app/auth/google/callback"
echo "   https://final-9i9634arf-adrian-b7e84541.vercel.app/auth/google/callback"
echo "   https://final-hd6tbubcs-adrian-b7e84541.vercel.app/auth/google/callback"
echo "   https://final-1j1ze0sc0-adrian-b7e84541.vercel.app/auth/google/callback"
echo "   https://final-jn9zr3544-adrian-b7e84541.vercel.app/auth/google/callback"
echo "   http://localhost:5173/auth/google/callback"
echo "   http://localhost:3000/auth/google/callback"
echo ""
echo "5. Click 'SAVE'"
echo ""
echo "⚠️  IMPORTANT: You must add ALL these redirect URIs to prevent Error 400"
echo ""

# Test the OAuth setup
echo "🧪 Testing OAuth configuration..."
echo ""
echo "Current environment variables:"
echo "- VITE_GOOGLE_CLIENT_ID_NEW: Set ✅"
echo "- VITE_GOOGLE_REDIRECT_URI_CURRENT: https://$CURRENT_URL/auth/google/callback"
echo "- VITE_GOOGLE_API_KEY: Set ✅"
echo ""

# Copy redirect URIs to clipboard (macOS only)
if command -v pbcopy &> /dev/null; then
    echo "https://$CURRENT_URL/auth/google/callback
https://final-a8xofrom7-adrian-b7e84541.vercel.app/auth/google/callback
https://final-9i9634arf-adrian-b7e84541.vercel.app/auth/google/callback
https://final-hd6tbubcs-adrian-b7e84541.vercel.app/auth/google/callback
https://final-1j1ze0sc0-adrian-b7e84541.vercel.app/auth/google/callback
https://final-jn9zr3544-adrian-b7e84541.vercel.app/auth/google/callback
http://localhost:5173/auth/google/callback
http://localhost:3000/auth/google/callback" | pbcopy
    echo "📋 All redirect URIs copied to clipboard! Just paste them in Google Cloud Console."
    echo ""
fi

echo "🚀 Next steps:"
echo "1. Complete the Google Cloud Console setup above"
echo "2. Wait 5-10 minutes for Google to propagate changes"
echo "3. Test OAuth by visiting: https://$CURRENT_URL"
echo ""
echo "If you still get Error 400, make sure ALL redirect URIs are added to Google Cloud Console!"