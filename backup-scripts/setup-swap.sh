#!/bin/bash

# ==========================================
# Setup Swap Memory
# Fixes "Next.js build stuck" on small EC2s
# ==========================================

echo "📦 Checking for existing swap..."
if grep -q "swapfile" /etc/fstab; then
    echo "✅ Swap already exists."
    free -h
    exit 0
fi

echo "📦 Creating 4GB Swap file..."
# Create a 4GB file
sudo dd if=/dev/zero of=/swapfile bs=128M count=32
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# Make it permanent
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

echo "✅ Swap created successfully!"
echo "📊 Memory Status:"
free -h

echo ""
echo "🚀 You can now run ./deploy-update.sh again."
