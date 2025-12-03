#!/bin/bash

# ==========================================
# Architecture Academics - Amazon Linux EC2 Deployment Script
# ==========================================
# This script automates deployment on Amazon Linux 2023/2
# Run as: bash deploy-amazonlinux.sh

set -e  # Exit on error

echo "🚀 Starting deployment on Amazon Linux..."

# ==========================================
# 1. UPDATE SYSTEM
# ==========================================
echo "📦 Updating system packages..."
sudo yum update -y

# ==========================================
# 2. INSTALL NODE.JS & PNPM
# ==========================================
echo "📦 Checking Node.js..."
if ! command -v node &> /dev/null; then
    echo "Installing Node.js 20 LTS..."
    curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
    sudo yum install -y nodejs
fi
echo "✅ Node.js version: $(node -v)"

echo "📦 Installing pnpm..."
if ! command -v pnpm &> /dev/null; then
    sudo npm install -g pnpm
fi
echo "✅ pnpm version: $(pnpm -v)"

# ==========================================
# 3. INSTALL PYTHON & PIP
# ==========================================
echo "📦 Installing Python 3..."
sudo yum install -y python3 python3-pip python3-devel
echo "✅ Python version: $(python3 --version)"

# Install additional build dependencies
sudo yum install -y gcc gcc-c++ make openssl-devel bzip2-devel libffi-devel

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
    sudo yum install -y nginx
fi
sudo systemctl enable nginx
echo "✅ Nginx installed"

# ==========================================
# 6. SETUP APPLICATION DIRECTORY
# ==========================================
APP_DIR="/home/ec2-user/architecture-academics-portal"
echo "📂 Using app directory: $APP_DIR"

if [ ! -d "$APP_DIR" ]; then
    echo "⚠️  ERROR: Application directory not found!"
    echo "   Please clone the repository first:"
    echo "   cd /home/ec2-user"
    echo "   git clone https://github.com/sujitlaware1809/architecture-academics-portal.git"
    exit 1
fi

cd "$APP_DIR"
echo "📥 Pulling latest changes..."
git pull origin main || echo "Using existing code..."

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
    echo ""
    echo "⚠️  WARNING: backend/.env not found!"
    echo ""
    echo "Creating .env from template..."
    cat > .env << 'EOF'
# AWS S3 Configuration
AWS_ACCESS_KEY_ID=your_aws_access_key_here
AWS_SECRET_ACCESS_KEY=your_aws_secret_key_here
AWS_REGION=us-east-1
S3_BUCKET_NAME=architecture-academics-videos

# Database Configuration
DATABASE_URL=sqlite:///./architecture_academics.db

# JWT Configuration - CHANGE THESE!
SECRET_KEY=CHANGE-THIS-TO-RANDOM-STRING
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS Origins
CORS_ORIGINS=["http://15.206.47.135"]

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-gmail-app-password
SMTP_FROM_EMAIL=noreply@15.206.47.135
SMTP_FROM_NAME=Architecture Academics
FRONTEND_URL=http://15.206.47.135
EOF
    echo ""
    echo "✅ Created backend/.env"
    echo "⚠️  IMPORTANT: Edit this file and add your credentials:"
    echo "   nano $APP_DIR/backend/.env"
    echo ""
    read -p "Press Enter after editing .env file..."
fi

deactivate

# ==========================================
# 8. SETUP FRONTEND
# ==========================================
echo "⚛️  Setting up frontend..."
cd "$APP_DIR/frontend"

# Create .env.local
if [ ! -f ".env.local" ]; then
    echo "Creating frontend/.env.local..."
    cat > .env.local << EOF
NEXT_PUBLIC_API_URL=http://15.206.47.135/api
NEXT_PUBLIC_SITE_URL=http://15.206.47.135
EOF
    echo "✅ Created frontend/.env.local"
fi

# Install dependencies
echo "📦 Installing frontend dependencies..."
pnpm install

# Build Next.js app
echo "🏗️  Building Next.js app (this may take a few minutes)..."
pnpm build

# ==========================================
# 9. UPDATE PM2 ECOSYSTEM CONFIG
# ==========================================
echo "⚙️  Updating PM2 configuration..."
cd "$APP_DIR"

# Update ecosystem.config.js with correct paths for Amazon Linux
cat > ecosystem.config.js << EOF
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
      env_file: '/home/ec2-user/architecture-academics-portal/backend/.env'
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
      }
    }
  ]
};
EOF

# Start PM2 processes
echo "🚀 Starting PM2 processes..."
pm2 delete all 2>/dev/null || true
pm2 start ecosystem.config.js
pm2 save

# Setup PM2 startup (for ec2-user)
sudo env PATH=\$PATH:/usr/bin pm2 startup systemd -u ec2-user --hp /home/ec2-user
pm2 save

echo "✅ PM2 processes started"
pm2 status

# ==========================================
# 10. CONFIGURE NGINX
# ==========================================
echo "🌐 Configuring Nginx..."

DOMAIN="15.206.47.135"

sudo tee /etc/nginx/conf.d/architecture-academics.conf > /dev/null <<EOF
server {
    listen 80;
    server_name $DOMAIN;

    # Backend API proxy
    location /api/ {
        proxy_pass http://127.0.0.1:8000;
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

# Test and restart Nginx
sudo nginx -t
sudo systemctl restart nginx
sudo systemctl enable nginx

echo "✅ Nginx configured and started"

# ==========================================
# 11. CONFIGURE FIREWALL (if firewalld is running)
# ==========================================
if sudo systemctl is-active --quiet firewalld; then
    echo "🔥 Configuring firewall..."
    sudo firewall-cmd --permanent --add-service=http
    sudo firewall-cmd --permanent --add-service=https
    sudo firewall-cmd --reload
    echo "✅ Firewall configured"
fi

# ==========================================
# 12. FINAL CHECKS
# ==========================================
echo ""
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
echo "   http://15.206.47.135"
echo ""
echo "⚠️  IMPORTANT REMINDERS:"
echo "   1. Edit backend/.env with your AWS, SMTP credentials"
echo "   2. Generate strong SECRET_KEY:"
echo "      python3 -c 'import secrets; print(secrets.token_urlsafe(64))'"
echo "   3. Restart backend after editing .env:"
echo "      pm2 restart aa-backend"
echo "   4. Make sure EC2 Security Group allows:"
echo "      - Port 22 (SSH)"
echo "      - Port 80 (HTTP)"
echo "      - Port 443 (HTTPS - if using SSL later)"
echo ""
echo "🐛 Troubleshooting:"
echo "   View logs: pm2 logs --lines 100"
echo "   Restart: pm2 restart all"
echo "   Status: pm2 status"
echo ""
