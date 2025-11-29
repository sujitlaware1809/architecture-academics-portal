#!/bin/bash

# ==========================================
# Architecture Academics - EC2 Deployment Script
# ==========================================
# This script automates deployment on Ubuntu EC2
# Run as: bash deploy.sh

set -e  # Exit on error

echo "🚀 Starting deployment..."

# ==========================================
# 1. UPDATE SYSTEM
# ==========================================
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# ==========================================
# 2. INSTALL NODE.JS & PNPM
# ==========================================
echo "📦 Installing Node.js 20 LTS..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt install -y nodejs build-essential
fi
echo "✅ Node.js version: $(node -v)"

echo "📦 Installing pnpm..."
if ! command -v pnpm &> /dev/null; then
    corepack enable
    corepack prepare pnpm@latest --activate
fi
echo "✅ pnpm version: $(pnpm -v)"

# ==========================================
# 3. INSTALL PYTHON & VENV
# ==========================================
echo "📦 Installing Python 3..."
sudo apt install -y python3 python3-venv python3-pip
echo "✅ Python version: $(python3 --version)"

# ==========================================
# 4. INSTALL PM2
# ==========================================
echo "📦 Installing PM2..."
if ! command -v pm2 &> /dev/null; then
    sudo npm install -g pm2
fi
echo "✅ PM2 installed"

# ==========================================
# 5. INSTALL NGINX
# ==========================================
echo "📦 Installing Nginx..."
if ! command -v nginx &> /dev/null; then
    sudo apt install -y nginx
fi
sudo systemctl enable nginx
echo "✅ Nginx installed"

# ==========================================
# 6. CLONE REPOSITORY (if not exists)
# ==========================================
APP_DIR="/home/ubuntu/architecture-academics-portal"
if [ ! -d "$APP_DIR" ]; then
    echo "📥 Cloning repository..."
    cd /home/ubuntu
    # REPLACE WITH YOUR REPO URL:
    git clone https://github.com/yourusername/architecture-academics-portal.git
else
    echo "📥 Pulling latest changes..."
    cd "$APP_DIR"
    git pull origin main
fi

# ==========================================
# 7. SETUP BACKEND
# ==========================================
echo "🐍 Setting up backend..."
cd "$APP_DIR/backend"

# Create virtual environment
if [ ! -d ".venv" ]; then
    python3 -m venv .venv
fi

# Activate and install dependencies
source .venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "⚠️  WARNING: backend/.env not found!"
    echo "   Copy .env.production and fill in your values:"
    echo "   cp ../.env.production .env"
    echo "   nano .env"
    read -p "Press Enter when .env is ready..."
fi

deactivate

# ==========================================
# 8. SETUP FRONTEND
# ==========================================
echo "⚛️  Setting up frontend..."
cd "$APP_DIR/frontend"

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "⚠️  WARNING: frontend/.env.local not found!"
    echo "   Create .env.local with:"
    echo "   NEXT_PUBLIC_API_URL=https://yourdomain.com/api"
    echo "   NEXT_PUBLIC_SITE_URL=https://yourdomain.com"
    read -p "Press Enter when .env.local is ready..."
fi

# Install dependencies
pnpm install

# Build Next.js app
echo "🏗️  Building Next.js app..."
pnpm build

# ==========================================
# 9. SETUP PM2 ECOSYSTEM
# ==========================================
echo "⚙️  Configuring PM2..."
cd "$APP_DIR"

# Edit ecosystem.config.js paths if needed
sed -i "s|/home/ubuntu/architecture-academics-portal|$APP_DIR|g" ecosystem.config.js

# Start PM2 processes
pm2 delete all || true  # Delete existing processes
pm2 start ecosystem.config.js
pm2 save

# Setup PM2 startup
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u ubuntu --hp /home/ubuntu
pm2 save

echo "✅ PM2 processes started"
pm2 status

# ==========================================
# 10. CONFIGURE NGINX
# ==========================================
echo "🌐 Configuring Nginx..."

DOMAIN=${1:-"15.206.47.135"}
echo "   Using IP/domain: $DOMAIN"

sudo tee /etc/nginx/sites-available/architecture-academics > /dev/null <<EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;

    # Backend API proxy
    location /api/ {
        proxy_pass http://127.0.0.1:8000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    # Frontend proxy
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# Enable site
sudo ln -sf /etc/nginx/sites-available/architecture-academics /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test and reload Nginx
sudo nginx -t
sudo systemctl reload nginx

echo "✅ Nginx configured"

# ==========================================
# 11. SETUP SSL (OPTIONAL)
# ==========================================
echo ""
echo "🔒 To setup SSL certificate, run:"
echo "   sudo apt install -y certbot python3-certbot-nginx"
echo "   sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN"
echo ""

# ==========================================
# 12. FINAL CHECKS
# ==========================================
echo "✅ Deployment complete!"
echo ""
echo "📊 Service Status:"
pm2 status
echo ""
echo "🔍 Check logs:"
echo "   Backend:  pm2 logs aa-backend"
echo "   Frontend: pm2 logs aa-frontend"
echo ""
echo "🌐 Access your site:"
echo "   http://$DOMAIN"
echo ""
echo "⚠️  IMPORTANT: Make sure to:"
echo "   1. Setup environment variables in backend/.env"
echo "   2. Setup environment variables in frontend/.env.local"
echo "   3. Configure your domain DNS to point to this server"
echo "   4. Run certbot for SSL certificate"
echo ""
