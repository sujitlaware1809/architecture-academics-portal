#!/bin/bash

# ==========================================
# Quick Redeploy Frontend - Fix API URL
# ==========================================

echo "🔄 Redeploying frontend with corrected API URL..."

APP_DIR="/home/ec2-user/architecture-academics-portal"
cd "$APP_DIR"

# Pull latest changes
echo "📥 Pulling latest code..."
git pull origin main

cd "$APP_DIR/frontend"

# Update .env.local with correct API URL (no double /api)
echo "📝 Updating .env.local..."
cat > .env.local << EOF
NEXT_PUBLIC_API_URL=http://15.206.47.135:8000
NEXT_PUBLIC_SITE_URL=http://15.206.47.135:3000
NEXT_PUBLIC_BACKEND_URL=http://15.206.47.135:8000
NODE_ENV=production
EOF

# Rebuild frontend
echo "🏗️  Rebuilding frontend..."
pnpm install
pnpm build

# Restart frontend service
echo "🔄 Restarting frontend..."
pm2 restart aa-frontend

sleep 2

echo "✅ Frontend redeployed successfully!"
echo ""
echo "🌐 Access: http://15.206.47.135:3000"
echo ""
echo "🔍 Check logs: pm2 logs aa-frontend"
