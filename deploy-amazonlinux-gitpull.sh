#!/bin/bash

# ==========================================
# Architecture Academics - Amazon Linux EC2 Deployment with Git Pull
# ==========================================
# This script pulls latest code from GitHub and deploys on Amazon Linux
# Run as: bash deploy-amazonlinux-gitpull.sh

set -e  # Exit on error

echo "🚀 Starting deployment on Amazon Linux with Git Pull..."

# ==========================================
# CONFIGURATION
# ==========================================
APP_DIR="/home/ec2-user/architecture-academics-portal"
GITHUB_REPO="https://github.com/sujitlaware1809/architecture-academics-portal.git"
BRANCH="main"

# ==========================================
# 1. PULL LATEST CODE FROM GITHUB
# ==========================================
echo "📥 Pulling latest code from GitHub..."
cd "$APP_DIR"

# Initialize git if not already done
if [ ! -d ".git" ]; then
    echo "Initializing git repository..."
    git clone "$GITHUB_REPO" .
else
    # Stash any local changes and pull
    git stash
    git pull origin "$BRANCH"
fi

echo "✅ Latest code pulled"

# ==========================================
# 2. SETUP BACKEND
# ==========================================
echo "🐍 Setting up backend..."
cd "$APP_DIR/backend"

# Create virtual environment if not exists
if [ ! -d ".venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv .venv
fi

# Activate virtual environment
source .venv/bin/activate

# Install/upgrade dependencies
echo "📦 Installing backend dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

# Create .env if not exists
if [ ! -f ".env" ]; then
    echo "Creating backend/.env..."
    cat > .env << 'EOF'
AWS_ACCESS_KEY_ID=your_aws_access_key_here
AWS_SECRET_ACCESS_KEY=your_aws_secret_key_here
AWS_REGION=us-east-1
S3_BUCKET_NAME=architecture-academics-videos
DATABASE_URL=sqlite:///./architecture_academics.db
SECRET_KEY=your-secret-key-change-this
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
CORS_ORIGINS=["http://localhost:3000"]
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM_EMAIL=noreply@example.com
SMTP_FROM_NAME=Architecture Academics
FRONTEND_URL=http://localhost:3000
EOF
    echo "✅ Created backend/.env - Please configure with your credentials"
fi

deactivate

# ==========================================
# 3. SETUP FRONTEND
# ==========================================
echo "⚛️  Setting up frontend..."
cd "$APP_DIR/frontend"

# Create .env.local if not exists
if [ ! -f ".env.local" ]; then
    echo "Creating frontend/.env.local..."
    cat > .env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost/api
NEXT_PUBLIC_SITE_URL=http://localhost
EOF
    echo "✅ Created frontend/.env.local"
fi

# Install dependencies
echo "📦 Installing frontend dependencies..."
pnpm install

# Build frontend
echo "🏗️  Building frontend..."
pnpm build

echo "✅ Frontend built successfully"

# ==========================================
# 4. RESTART SERVICES WITH PM2
# ==========================================
echo "🔄 Restarting services with PM2..."
cd "$APP_DIR"

# Update ecosystem config
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [
    {
      name: 'aa-backend',
      script: 'run_server.py',
      cwd: '$APP_DIR/backend',
      interpreter: '$APP_DIR/backend/.venv/bin/python',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env_file: '$APP_DIR/backend/.env',
      error_file: './logs/backend-error.log',
      out_file: './logs/backend-out.log'
    },
    {
      name: 'aa-frontend',
      script: 'pnpm',
      args: 'start',
      cwd: '$APP_DIR/frontend',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: '3000'
      },
      error_file: './logs/frontend-error.log',
      out_file: './logs/frontend-out.log'
    }
  ]
};
EOF

# Restart PM2
pm2 delete all 2>/dev/null || true
pm2 start ecosystem.config.js
pm2 save

echo "✅ Services restarted"
pm2 status

# ==========================================
# 5. CONFIGURE NGINX (if needed)
# ==========================================
echo "🌐 Configuring Nginx..."

sudo tee /etc/nginx/conf.d/architecture-academics.conf > /dev/null <<EOF
server {
    listen 80;
    server_name _;

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

sudo nginx -t && sudo systemctl restart nginx && sudo systemctl enable nginx
echo "✅ Nginx restarted"

# ==========================================
# 6. FINAL STATUS
# ==========================================
echo ""
echo "✅ Deployment complete!"
echo ""
echo "📊 Service Status:"
pm2 status
echo ""
echo "🔍 View logs:"
echo "   pm2 logs aa-backend"
echo "   pm2 logs aa-frontend"
echo ""
echo "🌐 Access application at your EC2 IP address"
echo ""
echo "⚠️  Next steps:"
echo "   1. Edit backend/.env with credentials:"
echo "      nano $APP_DIR/backend/.env"
echo "   2. Restart backend:"
echo "      pm2 restart aa-backend"
echo "   3. Check logs if issues occur:"
echo "      pm2 logs --lines 50"
echo ""
