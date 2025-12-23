#!/bin/bash

# ==========================================
# Quick Deploy Script - Run after initial setup
# ==========================================
# Use this to pull latest code and restart services
# Run as: bash quick-deploy.sh

set -e

APP_DIR="/home/ec2-user/architecture-academics-portal"

echo "🚀 Quick Deploy - Pulling latest changes..."

# Pull latest code
cd "$APP_DIR"
echo "📥 Git pull..."
git pull origin main

# Backend: install new dependencies if any
echo "🐍 Updating backend dependencies..."
cd "$APP_DIR/backend"
source .venv/bin/activate
pip install -r requirements.txt
deactivate

# Frontend: install and rebuild
echo "⚛️  Rebuilding frontend..."
cd "$APP_DIR/frontend"
pnpm install
pnpm build

# Restart services
echo "🔄 Restarting services..."
pm2 restart all

echo "✅ Deploy complete!"
echo ""
echo "📊 Status:"
pm2 status
echo ""
echo "🔍 Logs:"
echo "   pm2 logs"
echo ""
