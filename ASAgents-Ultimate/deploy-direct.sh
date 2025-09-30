#!/bin/bash

echo "🚀 Direct Vercel Deployment"
echo "==========================="
echo ""
echo "Since we're having local build issues with npm/node,"
echo "we'll let Vercel handle the build in their environment."
echo ""
echo "Vercel will:"
echo "  1. Clone the repository"
echo "  2. Install dependencies (fresh)"
echo "  3. Run the build"
echo "  4. Deploy"
echo ""

# Make sure we have latest code committed
git add -A
git commit -m "Production deployment - let Vercel build" || echo "No changes to commit"

# Deploy with Vercel (will build on their servers)
vercel --prod --yes

