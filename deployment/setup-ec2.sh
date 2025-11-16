#!/bin/bash

# Architecture Academics Portal - EC2 Setup Script
# Run this script on your EC2 instance (15.206.47.135) to set up the deployment environment

set -e

echo "🚀 Setting up Architecture Academics Portal on EC2..."

# Update system packages
echo "📦 Updating system packages..."
sudo yum update -y

# Install Node.js and npm
echo "📦 Installing Node.js and npm..."
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo yum install -y nodejs

# Install Python 3 and pip (if not already installed)
echo "📦 Installing Python 3..."
sudo yum install -y python3 python3-pip

# Install PM2 globally for process management
echo "📦 Installing PM2..."
sudo npm install -g pm2

# Create project directory
echo "📁 Creating project directory..."
sudo mkdir -p /home/ec2-user/architecture-academics-portal
sudo chown -R ec2-user:ec2-user /home/ec2-user/architecture-academics-portal

# Clone repository (you need to set this up with your GitHub repo)
echo "📥 Cloning repository..."
cd /home/ec2-user
git clone https://github.com/sujitlaware1809/architecture-academics-portal.git || {
    echo "⚠️  Repository not found. Please manually clone your repository to /home/ec2-user/architecture-academics-portal"
    echo "   Run: git clone <your-repo-url> architecture-academics-portal"
}

cd /home/ec2-user/architecture-academics-portal

# Setup backend
echo "🐍 Setting up backend..."
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Note: Database migrations are skipped to preserve existing data
# If you need to run migrations manually, use: python migrate_db.py
echo "ℹ️  Database migrations skipped to preserve existing data"

# Setup frontend
echo "⚛️  Setting up frontend..."
cd ../frontend
npm install

# Create environment file for frontend
echo "🔧 Creating frontend environment file..."
cat > .env.local << EOL
NEXT_PUBLIC_API_URL=http://15.206.47.135:8000
NEXT_PUBLIC_SITE_URL=http://15.206.47.135:3000
EOL

# Build frontend
echo "🔨 Building frontend..."
npm run build

# Copy systemd service files
echo "⚙️  Setting up systemd services..."
sudo cp ../deployment/frontend.service /etc/systemd/system/
sudo cp ../deployment/backend.service /etc/systemd/system/

# Make deployment scripts executable
chmod +x ../deployment/*.sh

# Secure database files (ensure they're never committed to git)
echo "🔒 Securing database files..."
../deployment/secure-database.sh

# Create backups directory OUTSIDE git repository to prevent accidental commits
mkdir -p /home/ec2-user/db-backups
echo "📁 Created database backups directory outside git repository"

# Reload systemd and enable services
sudo systemctl daemon-reload
sudo systemctl enable frontend
sudo systemctl enable backend

# Start services
echo "🚀 Starting services..."
sudo systemctl start backend
sudo systemctl start frontend

# Check service status
echo "📊 Service status:"
sudo systemctl status backend --no-pager
sudo systemctl status frontend --no-pager

# Setup firewall rules (if needed)
echo "🔥 Configuring firewall..."
sudo firewall-cmd --permanent --add-port=3000/tcp || echo "Firewall not active or port already open"
sudo firewall-cmd --permanent --add-port=8000/tcp || echo "Firewall not active or port already open"
sudo firewall-cmd --reload || echo "Firewall not active"

echo ""
echo "✅ Setup complete!"
echo ""
echo "🌐 Your application should now be accessible at:"
echo "   Frontend: http://15.206.47.135:3000"
echo "   Backend API: http://15.206.47.135:8000"
echo ""
echo "📝 To check logs:"
echo "   Backend logs: sudo journalctl -u backend -f"
echo "   Frontend logs: sudo journalctl -u frontend -f"
echo ""
echo "🔄 To restart services:"
echo "   sudo systemctl restart backend"
echo "   sudo systemctl restart frontend"