#!/bin/bash

# ==========================================
# Update & Redeploy Script
# IP: 15.206.47.135
# ==========================================

SERVER_IP="15.206.47.135"

echo "🚀 Starting update deployment for $SERVER_IP..."

# 0. Stop Services to Free Memory
echo "🛑 Stopping PM2 services to free up memory for build..."
pm2 stop all

# 1. Pull latest changes
echo "📥 Pulling latest code from git..."
git pull origin main

# 2. Configure Backend Environment
echo "⚙️ Configuring Backend .env..."
cd backend
cat > .env << EOF
DATABASE_URL=sqlite:///./architecture_academics.db
SECRET_KEY=production_secret_key_change_this
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
CORS_ORIGINS=http://$SERVER_IP:3000,http://localhost:3000
EOF

# Update Backend Dependencies
echo "📦 Installing backend dependencies..."
if [ -d ".venv" ]; then
    source .venv/bin/activate
else
    python3 -m venv .venv
    source .venv/bin/activate
fi
pip install -r requirements.txt

# Run Database Seeding
echo "🌱 Seeding Database..."
python seed_all.py

cd ..

# 3. Configure Frontend Environment
echo "⚙️ Configuring Frontend .env.local..."
cd frontend
cat > .env.local << EOF
NEXT_PUBLIC_API_URL=http://$SERVER_IP:8000
NEXT_PUBLIC_SITE_URL=http://$SERVER_IP:3000
NEXT_PUBLIC_BACKEND_URL=http://$SERVER_IP:8000
NODE_ENV=production
EOF

# 4. Build Frontend
echo "🏗️ Building Frontend..."
pnpm install
pnpm build

# 5. Restart Services
echo "🔄 Restarting PM2 services..."
pm2 restart aa-backend
pm2 restart aa-frontend

echo "✅ Update Complete!"
echo "👉 Frontend: http://$SERVER_IP:3000"
echo "👉 Backend: http://$SERVER_IP:8000/docs"
