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
chmod +x setup-port-3000.sh
./setup-port-3000.sh

echo "✅ RESET COMPLETE!"
