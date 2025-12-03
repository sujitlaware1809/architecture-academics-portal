#!/bin/bash

# ==========================================
# Force Rebuild Frontend - Clear Cache & Rebuild
# ==========================================

echo "🔄 Force rebuilding frontend with correct API URL..."

APP_DIR="/home/ec2-user/architecture-academics-portal"
cd "$APP_DIR/frontend"

# Export environment variables for build time
export NEXT_PUBLIC_API_URL=http://15.206.47.135:8000
export NEXT_PUBLIC_SITE_URL=http://15.206.47.135:3000
export NEXT_PUBLIC_BACKEND_URL=http://15.206.47.135:8000
export NODE_ENV=production

# Create .env.local
echo "📝 Creating .env.local..."
cat > .env.local << EOF
NEXT_PUBLIC_API_URL=http://15.206.47.135:8000
NEXT_PUBLIC_SITE_URL=http://15.206.47.135:3000
NEXT_PUBLIC_BACKEND_URL=http://15.206.47.135:8000
NODE_ENV=production
EOF

cat .env.local

# Clear Next.js cache
echo "🧹 Clearing Next.js cache..."
rm -rf .next

# Reinstall and rebuild
echo "📦 Installing dependencies..."
pnpm install

echo "🏗️  Building frontend..."
pnpm build

# Kill any existing frontend processes
echo "🛑 Stopping frontend service..."
pm2 stop aa-frontend
sleep 2

# Start fresh
echo "🚀 Starting frontend service..."
pm2 start aa-frontend --update-env

sleep 3

echo "✅ Frontend rebuild complete!"
echo ""
pm2 status
echo ""
echo "🔍 Check if API URL is correct:"
grep NEXT_PUBLIC_API_URL .env.local
echo ""
echo "📊 Logs:"
pm2 logs aa-frontend --lines 5
