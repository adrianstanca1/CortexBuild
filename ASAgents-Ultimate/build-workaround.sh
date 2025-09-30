#!/bin/bash
echo "🔧 Alternative Build Approach"
echo "=============================="

# Try installing with npm's alternative resolver
npm config set legacy-peer-deps true
npm install --force

echo "✅ Dependencies installed!"
echo "📦 Checking installation..."
ls -la node_modules/@vitejs/ 2>/dev/null || echo "⚠️  Still missing @vitejs"

# If still missing, manually fetch and install
if [ ! -d "node_modules/@vitejs/plugin-react" ]; then
  echo "📥 Manually installing @vitejs/plugin-react..."
  mkdir -p node_modules/@vitejs
  cd node_modules/@vitejs
  npm pack @vitejs/plugin-react@4.2.1
  tar -xzf vitejs-plugin-react-4.2.1.tgz
  mv package plugin-react
  rm vitejs-plugin-react-4.2.1.tgz
  cd ../..
fi

echo "🔨 Build attempt..."
npm run build

