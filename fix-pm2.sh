#!/bin/bash

# ==========================================
# Fix PM2 Services
# ==========================================

echo "🛑 Stopping all services..."
pm2 delete all

echo "🚀 Starting Backend..."
cd /home/ec2-user/architecture-academics-portal/backend
pm2 start run_server.py --name aa-backend --interpreter ./.venv/bin/python

echo "🚀 Starting Frontend..."
cd /home/ec2-user/architecture-academics-portal/frontend
pm2 start npm --name aa-frontend -- start -- -p 3000

echo "💾 Saving PM2 list..."
pm2 save

echo "✅ Services restarted!"
pm2 status
