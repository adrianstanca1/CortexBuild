#!/bin/bash

# ASAgents Ultimate - Quick Fix Deployment
echo "🔧 Fixing ASAgents Ultimate Deployment..."

# Remove protection and simplify
echo "Removing deployment protection..."

# Create minimal working version
echo "Creating minimal package.json..."
cat > package.json << 'EOF'
{
  "name": "asagents-ultimate",
  "private": true,
  "version": "2.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "@heroicons/react": "^2.1.1",
    "@tanstack/react-query": "^5.17.19",
    "axios": "^1.6.5",
    "lucide-react": "^0.314.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.22.0",
    "zustand": "^4.5.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.48",
    "@types/react-dom": "^18.2.18",
    "@vercel/node": "^5.3.24",
    "@vitejs/plugin-react": "^4.3.0",
    "typescript": "^5.3.3",
    "vite": "^5.1.0"
  }
}
EOF

echo "Creating simple vercel.json..."
cat > vercel.json << 'EOF'
{
  "version": 2,
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install --legacy-peer-deps",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "/api/:path*"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
EOF

echo "Committing changes..."
git add package.json vercel.json
git commit -m "Fix deployment with minimal config" --quiet || echo "No changes to commit"

echo "Deploying to Vercel..."
vercel --prod --yes

echo "✅ Deployment script complete!"