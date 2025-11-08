#!/bin/bash

# CortexBuild Deployment Verification Script
# Checks the status of your production deployment

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║        CortexBuild - Deployment Verification Script           ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

PRODUCTION_URL="https://cortex-build-mcnrk7yba-adrian-b7e84541.vercel.app"

echo "🔍 Checking Production Deployment..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if site is responding
echo "📡 Testing HTTP Response..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$PRODUCTION_URL")

if [ "$HTTP_CODE" -eq 200 ]; then
    echo "  ✅ Status: $HTTP_CODE OK - Site is fully accessible!"
elif [ "$HTTP_CODE" -eq 401 ]; then
    echo "  ⚠️  Status: $HTTP_CODE Unauthorized"
    echo "  ℹ️  Vercel Deployment Protection is enabled"
    echo ""
    echo "  📝 To disable protection:"
    echo "     1. Go to: https://vercel.com/dashboard"
    echo "     2. Select project: constructai-5"
    echo "     3. Settings → Deployment Protection → Disable"
elif [ "$HTTP_CODE" -eq 404 ]; then
    echo "  ❌ Status: $HTTP_CODE Not Found - Site not deployed"
elif [ "$HTTP_CODE" -eq 500 ]; then
    echo "  ❌ Status: $HTTP_CODE Server Error - Check deployment logs"
else
    echo "  ⚠️  Status: $HTTP_CODE - Unexpected response"
fi

echo ""

# Check HTTPS
echo "🔒 Checking SSL Certificate..."
if curl -s -I "$PRODUCTION_URL" | grep -q "HTTP/2"; then
    echo "  ✅ HTTPS: Active (HTTP/2)"
else
    echo "  ⚠️  HTTPS: Check required"
fi

echo ""

# Check server headers
echo "🖥️  Server Information..."
SERVER=$(curl -s -I "$PRODUCTION_URL" | grep -i "server:" | cut -d' ' -f2-)
if [ ! -z "$SERVER" ]; then
    echo "  ✅ Server: $SERVER"
else
    echo "  ⚠️  Server: Unknown"
fi

echo ""

# Git status
echo "📦 Git Repository Status..."
if git status &>/dev/null; then
    CURRENT_BRANCH=$(git branch --show-current)
    LAST_COMMIT=$(git log -1 --pretty=format:"%h - %s")
    echo "  ✅ Branch: $CURRENT_BRANCH"
    echo "  ✅ Last Commit: $LAST_COMMIT"
else
    echo "  ⚠️  Not a git repository"
fi

echo ""

# Check if build exists
echo "🏗️  Build Status..."
if [ -d ".next" ]; then
    BUILD_ID=$(cat .next/BUILD_ID 2>/dev/null || echo "unknown")
    echo "  ✅ Build Directory: Exists"
    echo "  ✅ Build ID: $BUILD_ID"
else
    echo "  ⚠️  Build Directory: Not found (run 'npm run build')"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Summary
echo "📊 SUMMARY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ "$HTTP_CODE" -eq 200 ]; then
    echo "  🎉 Status: FULLY OPERATIONAL"
    echo "  🌐 URL: $PRODUCTION_URL"
    echo ""
    echo "  ✅ Your site is live and accessible!"
    echo "  ✅ You can log in and test all features"
elif [ "$HTTP_CODE" -eq 401 ]; then
    echo "  ⚙️  Status: DEPLOYED (Protection Active)"
    echo "  🌐 URL: $PRODUCTION_URL"
    echo ""
    echo "  ✅ Deployment successful"
    echo "  ⚠️  Access blocked by Vercel Deployment Protection"
    echo ""
    echo "  📝 Next Step: Disable protection in Vercel dashboard"
    echo "     See: DISABLE_DEPLOYMENT_PROTECTION.md"
else
    echo "  ⚠️  Status: NEEDS ATTENTION"
    echo "  🌐 URL: $PRODUCTION_URL"
    echo "  🔍 HTTP Code: $HTTP_CODE"
    echo ""
    echo "  📝 Check deployment logs in Vercel dashboard"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📚 HELPFUL RESOURCES"
echo "  • Deployment Report:     DEPLOYMENT_SUCCESS_REPORT.md"
echo "  • Disable Protection:    DISABLE_DEPLOYMENT_PROTECTION.md"
echo "  • Environment Variables: VERCEL_ENV_VARS_TO_COPY.md"
echo "  • Vercel Dashboard:      https://vercel.com/dashboard"
echo ""

# Test credentials reminder
if [ "$HTTP_CODE" -eq 200 ]; then
    echo "🔑 TEST CREDENTIALS"
    echo "  Super Admin:"
    echo "    Email:    adrian.stanca1@gmail.com"
    echo "    Password: parola123"
    echo ""
fi

echo "✨ Run this script anytime: ./check-deployment.sh"
echo ""


