#!/bin/bash

# ==========================================
# HARD RESET SCRIPT
# Run this from your HOME directory:
# cp reset-deployment.sh ~/reset.sh && chmod +x ~/reset.sh && ~/reset.sh
# ==========================================

echo "🛑 HARD RESET INITIATED"

# 1. Stop and Delete All Processes
echo "Stopping PM2..."
pm2 delete all
pm2 flush

# 2. Free up Disk Space (Remove Swap temporarily)
echo "🧹 Cleaning disk space..."
if [ -f /swapfile ]; then
    echo "Removing old swap file..."
    sudo swapoff /swapfile
    sudo rm /swapfile
    # Remove from fstab to prevent errors
    sudo sed -i '/swapfile/d' /etc/fstab
fi

# 3. Delete Project Folder
echo "🗑️  Deleting project folder..."
cd /home/ec2-user
rm -rf architecture-academics-portal

# 4. Clone Fresh
echo "⬇️  Cloning fresh repository..."
git clone https://github.com/sujitlaware1809/architecture-academics-portal.git
cd architecture-academics-portal

# 5. Create Smaller Swap (2GB)
# 4GB was too big for your disk, causing ENOSPC
echo "📦 Creating 2GB Swap file..."
sudo dd if=/dev/zero of=/swapfile bs=128M count=16
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

# 6. Run Setup
echo "🚀 Running Setup..."

# Setup Backend
echo "🐍 Setting up backend..."
cd backend

# Create .env file
echo "📝 Creating backend .env file..."
cat > .env << 'EOF'
# Database Configuration
DATABASE_URL=sqlite:///./architecture_academics.db

# JWT Security
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

python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python seed_all.py
deactivate
cd ..

chmod +x setup-port-3000.sh
./setup-port-3000.sh

echo "✅ RESET COMPLETE!"
