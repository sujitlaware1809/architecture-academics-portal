#!/bin/bash

# ==========================================
# Complete Architecture Academics Deployment
# For Amazon Linux 2023/2 on EC2
# ==========================================
# EC2 IP: 15.206.47.135
# Run this script from scratch deployment

set -e

echo "🚀 Starting complete deployment..."
echo "📍 EC2 IP: 15.206.47.135"

# ==========================================
# 1. UPDATE SYSTEM & INSTALL BASICS
# ==========================================
echo ""
echo "📦 Updating system and installing dependencies..."
sudo yum update -y --skip-broken
sudo yum install -y git wget gcc gcc-c++ make openssl-devel

# ==========================================
# 2. INSTALL NODE.JS & PNPM
# ==========================================
echo ""
echo "📦 Installing Node.js 20 LTS..."
if ! command -v node &> /dev/null; then
    # Use nodesource setup without curl
    sudo yum install -y https://rpm.nodesource.com/pub_20.x/nodistro/repo/nodesource-release-nodistro-1.noarch.rpm
    sudo yum install -y nodejs
fi
echo "✅ Node.js: $(node -v)"
echo "✅ NPM: $(npm -v)"

echo "📦 Installing pnpm..."
sudo npm install -g pnpm
echo "✅ pnpm: $(pnpm -v)"

# ==========================================
# 3. INSTALL PYTHON 3
# ==========================================
echo ""
echo "📦 Installing Python 3 and dependencies..."
sudo yum install -y python3 python3-pip python3-devel
echo "✅ Python: $(python3 --version)"

# ==========================================
# 4. INSTALL PM2 GLOBALLY
# ==========================================
echo ""
echo "📦 Installing PM2..."
sudo npm install -g pm2
echo "✅ PM2 installed"

# ==========================================
# 5. INSTALL NGINX
# ==========================================
echo ""
echo "📦 Installing Nginx..."
sudo yum install -y nginx
sudo systemctl enable nginx
echo "✅ Nginx installed"

# ==========================================
# 6. CLONE REPOSITORY
# ==========================================
echo ""
echo "📥 Cloning repository..."
cd /home/ec2-user

if [ -d "architecture-academics-portal" ]; then
    echo "Repository already exists, pulling latest..."
    cd architecture-academics-portal
    git pull origin main
else
    git clone https://github.com/sujitlaware1809/architecture-academics-portal.git
    cd architecture-academics-portal
fi

APP_DIR="/home/ec2-user/architecture-academics-portal"
echo "✅ App directory: $APP_DIR"

# ==========================================
# 7. SETUP BACKEND WITH PYTHON VENV
# ==========================================
echo ""
echo "🐍 Setting up backend..."
cd "$APP_DIR/backend"

# Create virtual environment
python3 -m venv .venv
source .venv/bin/activate

# Upgrade pip and install dependencies
pip install --upgrade pip setuptools wheel
pip install -r requirements.txt

echo "✅ Backend dependencies installed"

# ==========================================
# 8. CREATE BACKEND .ENV FILE
# ==========================================
echo ""
echo "📝 Creating backend .env file..."

cat > .env << 'EOF'
# ==========================================
# BACKEND ENVIRONMENT CONFIGURATION
# ==========================================

# Database Configuration
DATABASE_URL=sqlite:///./architecture_academics.db

# JWT Security - IMPORTANT: Change these values!
SECRET_KEY=your-super-secret-key-change-this-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# AWS S3 Configuration
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
AWS_REGION=us-east-1
S3_BUCKET_NAME=architecture-academics-videos

# CORS Configuration
CORS_ORIGINS=["http://15.206.47.135", "http://15.206.47.135:80", "http://15.206.47.135:3000"]

# Email/SMTP Configuration
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=sujitlaware123@gmail.com
SMTP_PASSWORD=rkqa vzjv eylm dkcj
FROM_EMAIL=sujitlaware123@gmail.com
FROM_NAME=Architecture Academics

# Frontend URL
FRONTEND_URL=http://15.206.47.135:3000
EOF

echo "✅ Backend .env created at: $APP_DIR/backend/.env"
echo "⚠️  IMPORTANT: Edit the .env file with your AWS and email credentials"
echo "   nano $APP_DIR/backend/.env"

# ==========================================
# 8.5 SEED DATABASE
# ==========================================
echo ""
echo "🌱 Seeding database..."
source .venv/bin/activate
python seed_all.py
deactivate
echo "✅ Database seeded"

# ==========================================
# 9. SETUP FRONTEND
# ==========================================
echo ""
echo "⚛️  Setting up frontend..."
cd "$APP_DIR/frontend"

# Get the EC2 instance's internal IP
INTERNAL_IP=$(hostname -I | awk '{print $1}')
PUBLIC_IP="15.206.47.135"

# Create .env.local
cat > .env.local << EOF
# API Configuration
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api
NEXT_PUBLIC_SITE_URL=http://$PUBLIC_IP
NEXT_PUBLIC_BACKEND_URL=http://127.0.0.1:8000

# Build configuration
NODE_ENV=production
EOF

echo "✅ Frontend .env.local created with API URL: http://127.0.0.1:8000/api"

# Install dependencies
echo "📦 Installing frontend packages..."
pnpm install

# Build frontend
echo "🏗️  Building frontend (this may take 2-3 minutes)..."
pnpm build

echo "✅ Frontend build complete"

# ==========================================
# 10. SETUP PM2 ECOSYSTEM CONFIG
# ==========================================
echo ""
echo "⚙️  Configuring PM2 ecosystem..."
cd "$APP_DIR"

cat > ecosystem.config.js << 'EOFPM2'
module.exports = {
  apps: [
    {
      name: 'aa-backend',
      script: 'run_server.py',
      cwd: '/home/ec2-user/architecture-academics-portal/backend',
      interpreter: '/home/ec2-user/architecture-academics-portal/backend/.venv/bin/python',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env_file: '/home/ec2-user/architecture-academics-portal/backend/.env',
      error_file: '/home/ec2-user/architecture-academics-portal/logs/backend-error.log',
      out_file: '/home/ec2-user/architecture-academics-portal/logs/backend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
    },
    {
      name: 'aa-frontend',
      script: 'pnpm',
      args: 'start',
      cwd: '/home/ec2-user/architecture-academics-portal/frontend',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: '3000'
      },
      error_file: '/home/ec2-user/architecture-academics-portal/logs/frontend-error.log',
      out_file: '/home/ec2-user/architecture-academics-portal/logs/frontend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
    }
  ]
};
EOFPM2

# Create logs directory
mkdir -p "$APP_DIR/logs"

echo "✅ PM2 ecosystem configured"

# ==========================================
# 11. START PM2 SERVICES
# ==========================================
echo ""
echo "🚀 Starting PM2 services..."
pm2 delete all 2>/dev/null || true
pm2 start ecosystem.config.js
pm2 save

# Setup PM2 startup
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u ec2-user --hp /home/ec2-user
pm2 save

echo "✅ PM2 services started"

# ==========================================
# 12. CONFIGURE NGINX
# ==========================================
echo ""
echo "🌐 Configuring Nginx..."

sudo tee /etc/nginx/conf.d/architecture-academics.conf > /dev/null <<'EOFNGINX'
# Upstream definitions for load balancing
upstream backend_api {
    server 127.0.0.1:8000 max_fails=3 fail_timeout=30s;
    keepalive 32;
}

upstream frontend_app {
    server 127.0.0.1:3000 max_fails=3 fail_timeout=30s;
    keepalive 32;
}

# Main server block
server {
    listen 80 default_server;
    server_name _;
    
    client_max_body_size 100M;
    
    # Log configuration
    access_log /var/log/nginx/access.log;
    error_log /var/log/nginx/error.log;

    # API Routes - proxy to backend
    location /api/ {
        proxy_pass http://backend_api;
        proxy_http_version 1.1;
        
        # WebSocket support
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        
        # Headers
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $server_name;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        
        # Buffering
        proxy_buffering off;
        proxy_cache_bypass $http_pragma $http_authorization;
    }

    # Frontend - proxy to Next.js
    location / {
        proxy_pass http://frontend_app;
        proxy_http_version 1.1;
        
        # WebSocket support
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        
        # Headers
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $server_name;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        
        # Buffering
        proxy_buffering off;
        
        # For Next.js
        proxy_cache_bypass $http_pragma $http_authorization;
    }
}
EOFNGINX

# Test and restart nginx
sudo nginx -t
sudo systemctl restart nginx
sudo systemctl enable nginx

echo "✅ Nginx configured and started"

# ==========================================
# 13. OPEN FIREWALL PORTS
# ==========================================
echo ""
echo "🔥 Configuring firewall..."

if sudo systemctl is-active --quiet firewalld; then
    sudo firewall-cmd --permanent --add-service=http
    sudo firewall-cmd --permanent --add-service=https
    sudo firewall-cmd --reload
    echo "✅ Firewall updated"
else
    echo "⚠️  firewalld not running (may be using iptables or AWS Security Groups)"
fi

# ==========================================
# 14. FINAL STATUS & INFORMATION
# ==========================================
echo ""
echo "================================"
echo "✅ DEPLOYMENT COMPLETE!"
echo "================================"
echo ""
echo "🌐 Access your application:"
echo "   http://15.206.47.135"
echo ""
echo "📊 Service Status:"
pm2 status
echo ""
echo "🔍 View Logs:"
echo "   All logs:      pm2 logs"
echo "   Backend only:  pm2 logs aa-backend"
echo "   Frontend only: pm2 logs aa-frontend"
echo "   Last 50 lines: pm2 logs --lines 50"
echo ""
echo "⚠️  IMPORTANT NEXT STEPS:"
echo ""
echo "1️⃣  Edit backend environment variables:"
echo "   nano $APP_DIR/backend/.env"
echo ""
echo "   Configure these with YOUR values:"
echo "   - AWS_ACCESS_KEY_ID"
echo "   - AWS_SECRET_ACCESS_KEY"
echo "   - SMTP_USER & SMTP_PASSWORD (Gmail app password)"
echo "   - Generate SECRET_KEY: python3 -c 'import secrets; print(secrets.token_urlsafe(64))'"
echo ""
echo "2️⃣  After editing .env, restart backend:"
echo "   pm2 restart aa-backend"
echo ""
echo "3️⃣  Check if services are running:"
echo "   pm2 status"
echo ""
echo "4️⃣  Troubleshooting:"
echo "   - Check backend logs: pm2 logs aa-backend --lines 100"
echo "   - Check frontend logs: pm2 logs aa-frontend --lines 100"
echo "   - Restart all services: pm2 restart all"
echo ""
echo "5️⃣  To redeploy with latest code:"
echo "   bash /home/ec2-user/architecture-academics-portal/quick-deploy.sh"
echo ""
echo "================================"
echo "📍 EC2 IP: 15.206.47.135"
echo "================================"
echo ""
