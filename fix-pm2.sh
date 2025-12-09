#!/bin/bash

# ==========================================
# Fix PM2 Services
# ==========================================

echo "🛑 Stopping all services..."
pm2 delete all

echo "🚀 Starting Backend..."
cd /home/ec2-user/architecture-academics-portal/backend
# Use absolute path to python interpreter
PYTHON_PATH="/home/ec2-user/architecture-academics-portal/backend/.venv/bin/python"
if [ ! -f "$PYTHON_PATH" ]; then
    echo "⚠️  Virtual environment not found, creating one..."
    python3 -m venv .venv
    source .venv/bin/activate
    pip install -r requirements.txt
fi
pm2 start run_server.py --name aa-backend --interpreter "$PYTHON_PATH"

echo "🚀 Starting Frontend..."
cd /home/ec2-user/architecture-academics-portal/frontend
pm2 start npm --name aa-frontend -- start -- -p 3000

echo "💾 Saving PM2 list..."
pm2 save

echo "✅ Services restarted!"
pm2 status
