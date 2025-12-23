#!/bin/bash

# ==========================================
# Setup Frontend on Port 3000
# Frontend and Backend run independently
# Frontend: http://15.206.47.135:3000
# Backend API: http://15.206.47.135:8000/api
# ==========================================

echo "🔧 Setting up frontend on port 3000..."

APP_DIR="/home/ec2-user/architecture-academics-portal"
cd "$APP_DIR/frontend"

# Update .env.local for direct port access
echo "📝 Updating frontend .env.local..."
cat > .env.local << EOF
# Direct Backend API URL (without /api - routes add it)
NEXT_PUBLIC_API_URL=http://15.206.47.135:8000
NEXT_PUBLIC_SITE_URL=http://15.206.47.135:3000
NEXT_PUBLIC_BACKEND_URL=http://15.206.47.135:8000
NODE_ENV=production
EOF

echo "✅ Frontend .env.local configured"
echo ""
echo "📋 Configuration:"
echo "   Frontend: http://15.206.47.135:3000"
echo "   Backend API: http://15.206.47.135:8000"
echo "   Auth Routes: http://15.206.47.135:8000/api/auth/login"
echo ""

# Rebuild frontend
echo "🏗️  Rebuilding frontend..."
pnpm install
pnpm build

# Restart services
echo "🔄 Starting services..."
cd "$APP_DIR"
pm2 delete all 2>/dev/null || true
pm2 start ecosystem.config.js --env production
pm2 save

sleep 5

echo ""
echo "✅ Frontend and Backend ready!"
echo ""
echo "📊 Service Status:"
pm2 status
echo ""
echo "🌐 Access your application:"
echo "   Frontend: http://15.206.47.135:3000"
echo "   Backend API: http://15.206.47.135:8000"
echo ""
echo "🔍 Check logs:"
echo "   Frontend: pm2 logs aa-frontend"
echo "   Backend: pm2 logs aa-backend"
echo ""
